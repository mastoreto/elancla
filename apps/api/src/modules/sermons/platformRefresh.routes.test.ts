import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import path from "node:path";
import {
  type CreateSermonResponse,
  grant,
  PERMISSIONS,
  type PlatformLinkDto,
  type SermonSnapshot,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createRecordedYoutubeFetch,
  RECORDED_YOUTUBE_API_KEY,
} from "../../../test/support/recordedYoutubeFetch";
import { getAuth } from "../../core/auth";
import {
  createYoutubePlatform,
  MAX_VIDEOS_PER_BATCH,
  setVideoPlatformForTests,
} from "../../core/platforms";
import { VIDEO_PLATFORM_CONTRACT_IDS as IDS } from "../../core/platforms/videoPlatformContract";
import { getStorageEnv } from "../../core/storage";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const RUN = crypto.randomUUID().slice(0, 8);
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";
const FILLER_PREFIX = `fill-${RUN}-`;
const FILLER_COUNT = 60;
const FIXTURES_DIR = path.resolve(
  import.meta.dir,
  "../../../test/fixtures/youtube",
);

let organizationId = "";
let editor = "";
let viewer = "";
const sermonIds: string[] = [];

const recordedPlatform = () =>
  createYoutubePlatform({
    apiKey: RECORDED_YOUTUBE_API_KEY,
    fetch: createRecordedYoutubeFetch(),
  });

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  const auth = getAuth();
  const cookieOf = async (
    label: string,
    access: Parameters<typeof fixtures.passwordUser>[2],
  ) => fixtures.signIn(auth, await fixtures.passwordUser(auth, label, access));
  editor = await cookieOf("refresh-editor", [
    grant(PERMISSIONS.sermons.view),
    grant(PERMISSIONS.sermons.create),
    grant(PERMISSIONS.sermons.edit),
  ]);
  viewer = await cookieOf("refresh-viewer", [grant(PERMISSIONS.sermons.view)]);
  setVideoPlatformForTests(recordedPlatform());
});

afterAll(async () => {
  setVideoPlatformForTests(undefined);
  await db.platformLink.deleteMany({
    where: {
      organizationId,
      OR: [
        { entityId: { in: sermonIds } },
        { externalId: { startsWith: FILLER_PREFIX } },
      ],
    },
  });
  await db.sermon.deleteMany({ where: { id: { in: sermonIds } } });
  await fixtures.cleanup();
});

const codeOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { code: string }).code;

async function createSermonFromVideo(video: string): Promise<string> {
  const res = await call("POST", "/content/sermons", {
    cookie: editor,
    body: { video },
  });
  expect(res.status).toBe(201);
  const { id } = (await res.json()) as CreateSermonResponse;
  sermonIds.push(id);
  return id;
}

/** A sermon linked by hand to a video, for what the recorded single lookup does not know. */
async function linkedSermon(
  externalId: string,
  viewCount: number,
): Promise<{ sermonId: string; linkId: string }> {
  const sermon = await db.sermon.create({ data: { organizationId } });
  sermonIds.push(sermon.id);
  await db.platformLink.deleteMany({ where: { organizationId, externalId } });
  const link = await db.platformLink.create({
    data: {
      organizationId,
      entityType: "SERMON",
      entityId: sermon.id,
      platform: "YOUTUBE",
      externalId,
      url: `https://www.youtube.com/watch?v=${externalId}`,
      viewCount,
    },
  });
  return { sermonId: sermon.id, linkId: link.id };
}

const refresh = (sermonId: string, cookie = editor) =>
  call("POST", `/content/sermons/${sermonId}/platform/refresh`, { cookie });

const linkOf = (sermonId: string) =>
  db.platformLink.findFirstOrThrow({
    where: { organizationId, entityType: "SERMON", entityId: sermonId },
  });

const latestRevision = (sermonId: string) =>
  db.contentRevision.findFirstOrThrow({
    where: { organizationId, entityId: sermonId, contentType: "SERMON" },
    orderBy: { number: "desc" },
  });

describe("refreshing one sermon by hand", () => {
  test("rewrites the platform data and never the text the editors wrote", async () => {
    const sermonId = await createSermonFromVideo(IDS.publicVideoId);
    const preloaded = (await latestRevision(sermonId))
      .snapshot as unknown as SermonSnapshot;

    // The preloaded text can be overwritten: an editor saves the draft with their own words.
    const edited: SermonSnapshot = {
      ...preloaded,
      translations: {
        es: {
          ...(preloaded.translations
            .es as SermonSnapshot["translations"][string]),
          title: "Un título escrito a mano",
          summary: "Un resumen propio",
        },
      },
    };
    const saved = await call("PUT", `/editorial/sermon/${sermonId}/draft`, {
      cookie: editor,
      body: { snapshot: edited },
    });
    expect(saved.status).toBe(200);
    const beforeRefresh = await latestRevision(sermonId);
    expect(beforeRefresh.snapshot).toMatchObject({
      translations: { es: { title: "Un título escrito a mano" } },
    });

    // The platform data is out of date.
    await db.platformLink.updateMany({
      where: { entityId: sermonId },
      data: {
        viewCount: 1,
        durationSeconds: 5,
        thumbnailUrl: "https://i.ytimg.com/old.jpg",
        fetchedAt: null,
      },
    });

    const res = await refresh(sermonId);
    expect(res.status).toBe(200);
    expect((await res.json()) as PlatformLinkDto).toMatchObject({
      externalId: IDS.publicVideoId,
      viewCount: 1523,
      durationSeconds: 3723,
      thumbnailUrl: "https://i.ytimg.com/vi/Xr2hP9vKq1M/maxresdefault.jpg",
      platformPublishedAt: "2026-11-15T15:30:12.000Z",
    });
    expect((await linkOf(sermonId)).fetchedAt).not.toBeNull();

    const afterRefresh = await latestRevision(sermonId);
    expect(afterRefresh.id).toBe(beforeRefresh.id);
    expect(afterRefresh.snapshot).toEqual(beforeRefresh.snapshot);
    expect(afterRefresh.updatedAt).toEqual(beforeRefresh.updatedAt);

    const [audit] = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "sermon.platformRefreshed",
    });
    expect(audit?.entityId).toBe(sermonId);
    expect(audit?.before).toMatchObject({ viewCount: 1 });
    expect(audit?.after).toMatchObject({ viewCount: 1523 });
  });

  test("a video that is private or gone is an error and leaves the data as it was", async () => {
    const { sermonId } = await linkedSermon(IDS.secondVideoId, 7);
    for (const [externalId, status, code] of [
      [IDS.privateVideoId, 422, "video_private"],
      [IDS.missingVideoId, 404, "video_not_found"],
    ] as const) {
      await db.platformLink.updateMany({
        where: { entityId: sermonId },
        data: { externalId, viewCount: 7 },
      });
      const res = await refresh(sermonId);
      expect(res.status).toBe(status);
      expect(await codeOf(res)).toBe(code);
      expect((await linkOf(sermonId)).viewCount).toBe(7);
    }
  });

  test("an unknown sermon is a 404, a viewer cannot refresh and no platform is a 503", async () => {
    expect((await refresh(UNKNOWN_ID)).status).toBe(404);
    const sermonId = (
      await db.platformLink.findFirstOrThrow({
        where: { organizationId, externalId: IDS.publicVideoId },
      })
    ).entityId;
    expect((await refresh(sermonId, viewer)).status).toBe(403);

    setVideoPlatformForTests(null);
    try {
      const res = await refresh(sermonId);
      expect(res.status).toBe(503);
      expect(await codeOf(res)).toBe("platform_unavailable");
    } finally {
      setVideoPlatformForTests(recordedPlatform());
    }
  });
});

describe("the daily refresh (cron)", () => {
  const { CRON_SECRET } = (() => getStorageEnv())();
  const refreshAll = (authorization?: string) =>
    call("GET", "/internal/platforms/refresh", {
      headers: authorization ? { Authorization: authorization } : {},
    });

  test("without the secret it is a 401, whoever asks", async () => {
    expect((await refreshAll()).status).toBe(401);
    expect((await refreshAll("Bearer wrong")).status).toBe(401);
    expect((await refreshAll(`Basic ${CRON_SECRET}`)).status).toBe(401);
    expect((await refreshAll(CRON_SECRET)).status).toBe(401);
  });

  test("with the secret it refreshes the links in batches of 50 and leaves the videos it cannot read alone", async () => {
    const batchBody = (await Bun.file(
      path.join(FIXTURES_DIR, "videos-batch.json"),
    ).json()) as { items: { id: string }[] };
    const requested: string[][] = [];
    // Answers any batch with the recorded items it asks for, so the real table can be any size.
    const batchFetch = async (input: string): Promise<Response> => {
      const ids = new URL(input).searchParams.get("id")?.split(",") ?? [];
      requested.push(ids);
      return Response.json({
        ...batchBody,
        items: batchBody.items.filter((item) => ids.includes(item.id)),
      });
    };
    setVideoPlatformForTests(
      createYoutubePlatform({
        apiKey: RECORDED_YOUTUBE_API_KEY,
        fetch: batchFetch,
      }),
    );

    const linkFor = async (externalId: string, viewCount: number) => {
      const { linkId } = await linkedSermon(externalId, viewCount);
      return { id: linkId };
    };
    const publicLink = await linkFor(IDS.publicVideoId, 1);
    const secondLink = await linkFor(IDS.secondVideoId, 2);
    const privateLink = await linkFor(IDS.privateVideoId, 3);
    await db.platformLink.createMany({
      data: Array.from({ length: FILLER_COUNT }, (_, index) => ({
        organizationId,
        entityType: "SERMON" as const,
        entityId: crypto.randomUUID(),
        platform: "YOUTUBE" as const,
        externalId: `${FILLER_PREFIX}${index}`,
        url: "https://www.youtube.com/watch?v=x",
        viewCount: 9,
      })),
    });
    const total = await db.platformLink.count({
      where: { platform: "YOUTUBE" },
    });

    const res = await refreshAll(`Bearer ${CRON_SECRET}`);
    expect(res.status).toBe(200);
    const { refreshed } = (await res.json()) as { refreshed: number };
    // The public and the second video came back; the private one, the fillers and every link
    // outside the recording did not.
    expect(refreshed).toBeGreaterThanOrEqual(2);

    expect(requested).toHaveLength(Math.ceil(total / MAX_VIDEOS_PER_BATCH));
    for (const ids of requested) {
      expect(ids.length).toBeLessThanOrEqual(MAX_VIDEOS_PER_BATCH);
    }
    const read = (id: string) =>
      db.platformLink.findUniqueOrThrow({ where: { id } });
    expect(await read(publicLink.id)).toMatchObject({
      viewCount: 1523,
      durationSeconds: 3723,
    });
    expect(await read(secondLink.id)).toMatchObject({ viewCount: 980 });
    expect((await read(privateLink.id)).viewCount).toBe(3);
    expect(
      await db.platformLink.count({
        where: { externalId: { startsWith: FILLER_PREFIX }, viewCount: 9 },
      }),
    ).toBe(FILLER_COUNT);
  });

  test("a platform that fails is a 503 and without a platform there is nothing to refresh", async () => {
    setVideoPlatformForTests(
      createYoutubePlatform({
        apiKey: RECORDED_YOUTUBE_API_KEY,
        fetch: async () => new Response("quota", { status: 403 }),
      }),
    );
    const failed = await refreshAll(`Bearer ${CRON_SECRET}`);
    expect(failed.status).toBe(503);
    expect(await codeOf(failed)).toBe("platform_unavailable");

    setVideoPlatformForTests(null);
    const none = await refreshAll(`Bearer ${CRON_SECRET}`);
    expect(none.status).toBe(200);
    expect(await none.json()).toEqual({ refreshed: 0 });
  });
});
