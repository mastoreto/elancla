import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createRecordedYoutubeFetch,
  RECORDED_YOUTUBE_API_KEY,
} from "../../../test/support/recordedYoutubeFetch";
import {
  createYoutubePlatform,
  setVideoPlatformForTests,
} from "../../core/platforms";
import { VIDEO_PLATFORM_CONTRACT_IDS as IDS } from "../../core/platforms/videoPlatformContract";
import { PUBLIC_LIVE_CACHE_CONTROL } from "./public.routes";
import { clearPublicLiveCache } from "./useCases";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

let slug = "";
let key = "";
let organizationId = "";

const getLive = () =>
  call("GET", `/public/v1/${slug}/live`, {
    headers: { Authorization: `Bearer ${key}` },
  });

const setChannel = (youtubeChannelId: string | null) =>
  db.siteSettings.upsert({
    where: { organizationId },
    create: {
      organizationId,
      name: "Live test",
      url: "https://live.test",
      youtubeChannelId,
    },
    update: { youtubeChannelId },
  });

function recordedPlatform() {
  const recorded = createRecordedYoutubeFetch();
  const platform = createYoutubePlatform({
    apiKey: RECORDED_YOUTUBE_API_KEY,
    fetch: recorded,
  });
  return { platform, recorded };
}

beforeAll(async () => {
  const organization = await fixtures.createOrganization("live");
  organizationId = organization.id;
  slug = organization.slug;
  key = (await fixtures.createSiteKey(organizationId)).key;
});

beforeEach(() => {
  clearPublicLiveCache();
});

afterAll(async () => {
  setVideoPlatformForTests(undefined);
  await fixtures.cleanup();
});

describe("GET /public/v1/:churchSlug/live", () => {
  test("needs the site key of the church", async () => {
    const res = await call("GET", `/public/v1/${slug}/live`);
    expect(res.status).toBe(401);
  });

  test("is not live when there is no platform key", async () => {
    setVideoPlatformForTests(null);
    await setChannel(IDS.liveChannelId);
    const res = await getLive();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ live: false });
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_LIVE_CACHE_CONTROL);
  });

  test("is not live when the church has no channel, without asking the platform", async () => {
    const { platform, recorded } = recordedPlatform();
    setVideoPlatformForTests(platform);
    await setChannel(null);
    const res = await getLive();
    expect(await res.json()).toEqual({ live: false });
    expect(recorded.requests).toEqual([]);
  });

  test("answers the stream on air, with the 60 second cache header", async () => {
    setVideoPlatformForTests(recordedPlatform().platform);
    await setChannel(IDS.liveChannelId);
    const res = await getLive();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=30",
    );
    expect(await res.json()).toEqual({
      live: true,
      videoId: expect.any(String),
      title: expect.any(String),
    });
  });

  test("is not live when the channel has nothing on air", async () => {
    setVideoPlatformForTests(recordedPlatform().platform);
    await setChannel(IDS.offlineChannelId);
    expect(await (await getLive()).json()).toEqual({ live: false });
  });

  test("asks the platform once per minute per church", async () => {
    const { platform, recorded } = recordedPlatform();
    setVideoPlatformForTests(platform);
    await setChannel(IDS.liveChannelId);
    const first = await (await getLive()).json();
    const requestsAfterFirst = recorded.requests.length;
    expect(requestsAfterFirst).toBeGreaterThan(0);
    const second = await (await getLive()).json();
    expect(second).toEqual(first);
    expect(recorded.requests).toHaveLength(requestsAfterFirst);
  });

  test("a platform that cannot answer is a 503 that is not remembered", async () => {
    const failing = createYoutubePlatform({
      apiKey: RECORDED_YOUTUBE_API_KEY,
      fetch: async () => new Response("down", { status: 500 }),
    });
    setVideoPlatformForTests(failing);
    await setChannel(IDS.liveChannelId);
    const down = await getLive();
    expect(down.status).toBe(503);
    // An error is never cached by the CDN.
    expect(down.headers.get("Cache-Control")).toBe("private, no-store");

    setVideoPlatformForTests(recordedPlatform().platform);
    expect((await getLive()).status).toBe(200);
  });
});
