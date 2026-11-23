import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  setSystemTime,
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
import {
  PUBLIC_LIVE_CACHE_CONTROL,
  PUBLIC_LIVE_DEGRADED_CACHE_CONTROL,
} from "./public.routes";
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

  describe("when the platform cannot answer", () => {
    const DEGRADED_TTL_MS = 15 * 1000;
    const warn = console.warn;
    let warnings: unknown[][] = [];

    beforeEach(() => {
      warnings = [];
      console.warn = (...args: unknown[]) => {
        warnings.push(args);
      };
    });

    afterEach(() => {
      console.warn = warn;
      setSystemTime();
    });

    function failingPlatform() {
      const requests: string[] = [];
      const platform = createYoutubePlatform({
        apiKey: RECORDED_YOUTUBE_API_KEY,
        fetch: async (input) => {
          requests.push(input);
          return new Response("down", { status: 500 });
        },
      });
      return { platform, requests };
    }

    test("it answers 200 not live, with a 15 second cache header, and logs a warning", async () => {
      setVideoPlatformForTests(failingPlatform().platform);
      await setChannel(IDS.liveChannelId);
      const res = await getLive();
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ live: false });
      expect(res.headers.get("Cache-Control")).toBe(
        PUBLIC_LIVE_DEGRADED_CACHE_CONTROL,
      );
      expect(PUBLIC_LIVE_DEGRADED_CACHE_CONTROL).toBe("public, s-maxage=15");
      expect(warnings).toHaveLength(1);
      expect(warnings[0]?.[0]).toBe(
        "Live status unavailable, answering not live",
      );
    });

    test("the failure is remembered for 15 seconds, not 60", async () => {
      const { platform, requests } = failingPlatform();
      setVideoPlatformForTests(platform);
      await setChannel(IDS.liveChannelId);
      await getLive();
      const requestsAfterFailure = requests.length;
      await getLive();
      expect(requests).toHaveLength(requestsAfterFailure);

      // The platform is back: once the 15 seconds pass the answer is read again, and a good
      // answer carries the normal 60 second header.
      setVideoPlatformForTests(recordedPlatform().platform);
      setSystemTime(new Date(Date.now() + DEGRADED_TTL_MS + 1000));
      const recovered = await getLive();
      expect(recovered.status).toBe(200);
      expect(await recovered.json()).toMatchObject({ live: true });
      expect(recovered.headers.get("Cache-Control")).toBe(
        PUBLIC_LIVE_CACHE_CONTROL,
      );
    });

    test("a good answer is still kept for the full minute", async () => {
      const { platform, recorded } = recordedPlatform();
      setVideoPlatformForTests(platform);
      await setChannel(IDS.liveChannelId);
      await getLive();
      const requestsAfterFirst = recorded.requests.length;
      setSystemTime(new Date(Date.now() + DEGRADED_TTL_MS + 1000));
      await getLive();
      expect(recorded.requests).toHaveLength(requestsAfterFirst);
    });
  });
});
