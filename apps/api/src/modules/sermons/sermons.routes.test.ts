import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type CreateSermonResponse,
  type EditorialStatusDto,
  grant,
  PERMISSIONS,
  type PlatformLookupDto,
  type PlatformSuggestionListDto,
  type SermonListDto,
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
  setVideoPlatformForTests,
} from "../../core/platforms";
import { VIDEO_PLATFORM_CONTRACT_IDS as IDS } from "../../core/platforms/videoPlatformContract";
import { resolveOrganizationId } from "../../core/tenancy";
import { clearPlatformSuggestionsCache } from "./useCases";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const RUN = crypto.randomUUID().slice(0, 8);
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";
const VIDEO_URL = `https://www.youtube.com/watch?v=${IDS.publicVideoId}`;
const ALL_VIDEO_IDS = [
  IDS.publicVideoId,
  IDS.secondVideoId,
  IDS.privateVideoId,
  IDS.missingVideoId,
  "Ab3dEf5GhIj",
];

let organizationId = "";
let editor = "";
let viewer = "";
let podcastCreator = "";
let originalChannelId: string | null = null;
const recorded = createRecordedYoutubeFetch();

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  const auth = getAuth();
  const cookieOf = async (
    label: string,
    access: Parameters<typeof fixtures.passwordUser>[2],
  ) => fixtures.signIn(auth, await fixtures.passwordUser(auth, label, access));
  editor = await cookieOf("sermons-editor", [
    grant(PERMISSIONS.sermons.view),
    grant(PERMISSIONS.sermons.create),
    grant(PERMISSIONS.sermons.edit),
    grant(PERMISSIONS.sermons.delete),
    grant(PERMISSIONS.sermons.publish),
  ]);
  viewer = await cookieOf("sermons-viewer", [grant(PERMISSIONS.sermons.view)]);
  podcastCreator = await cookieOf("sermons-podcast-creator", [
    grant(PERMISSIONS.podcasts.create),
  ]);
  const settings = await db.siteSettings.findUniqueOrThrow({
    where: { organizationId },
    select: { youtubeChannelId: true },
  });
  originalChannelId = settings.youtubeChannelId;
  setVideoPlatformForTests(
    createYoutubePlatform({
      apiKey: RECORDED_YOUTUBE_API_KEY,
      fetch: recorded,
    }),
  );
});

afterAll(async () => {
  setVideoPlatformForTests(undefined);
  clearPlatformSuggestionsCache();
  await db.siteSettings.update({
    where: { organizationId },
    data: { youtubeChannelId: originalChannelId },
  });
  const links = await db.platformLink.findMany({
    where: { organizationId, externalId: { in: ALL_VIDEO_IDS } },
    select: { entityId: true },
  });
  await db.platformLink.deleteMany({
    where: { organizationId, externalId: { in: ALL_VIDEO_IDS } },
  });
  await db.sermon.deleteMany({
    where: { id: { in: links.map((link) => link.entityId) } },
  });
  await db.sermonSeries.deleteMany({
    where: { translations: { some: { title: { contains: RUN } } } },
  });
  await fixtures.cleanup();
});

const codeOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { code: string }).code;

const lookup = (input: string, cookie = editor) =>
  call("POST", "/content/platform-lookup", {
    cookie,
    body: { input, for: "sermon" },
  });

const createSermon = (body: Record<string, unknown>) =>
  call("POST", "/content/sermons", { cookie: editor, body });

const deleteSermon = (id: string) =>
  call("DELETE", `/content/sermons/${id}`, { cookie: editor });

async function listItems(): Promise<SermonListDto["items"]> {
  const res = await call("GET", "/content/sermons", { cookie: editor });
  expect(res.status).toBe(200);
  return ((await res.json()) as SermonListDto).items;
}

/** What exists for the organization: a failed creation must leave all of it as it was. */
async function countRows() {
  const where = { organizationId };
  return {
    sermons: await db.sermon.count({ where }),
    links: await db.platformLink.count({ where }),
    series: await db.sermonSeries.count({ where }),
    revisions: await db.contentRevision.count({
      where: { ...where, contentType: "SERMON" },
    }),
  };
}

async function workingSnapshot(sermonId: string): Promise<SermonSnapshot> {
  const revision = await db.contentRevision.findFirstOrThrow({
    where: { organizationId, entityId: sermonId, contentType: "SERMON" },
    orderBy: { number: "desc" },
  });
  return revision.snapshot as unknown as SermonSnapshot;
}

describe("platform lookup", () => {
  test("previews a video from its URL or its id, and says it is not linked yet", async () => {
    for (const input of [VIDEO_URL, IDS.publicVideoId]) {
      const res = await lookup(input);
      expect(res.status).toBe(200);
      expect((await res.json()) as PlatformLookupDto).toEqual({
        externalId: IDS.publicVideoId,
        title: "La fe que permanece | Serie Firmes en la tormenta",
        description:
          "Mensaje del domingo sobre Hebreos 11.\n\nSuscríbete y activa la campana.\nwww.elancla.example",
        thumbnailUrl: "https://i.ytimg.com/vi/Xr2hP9vKq1M/maxresdefault.jpg",
        durationSeconds: 3723,
        publishedAt: "2026-11-15T15:30:12.000Z",
        alreadyLinked: false,
      });
    }
  });

  test("an invalid identifier, a private and a missing video are clear errors", async () => {
    const invalid = await lookup("https://example.com/watch");
    expect(invalid.status).toBe(422);
    expect(await codeOf(invalid)).toBe("invalid_video_id");

    const hidden = await lookup(IDS.privateVideoId);
    expect(hidden.status).toBe(422);
    expect(await codeOf(hidden)).toBe("video_private");

    const missing = await lookup(IDS.missingVideoId);
    expect(missing.status).toBe(404);
    expect(await codeOf(missing)).toBe("video_not_found");
  });

  test("whoever may create podcast episodes may look a video up; viewing sermons is not enough", async () => {
    expect((await lookup(IDS.publicVideoId, podcastCreator)).status).toBe(200);
    expect((await lookup(IDS.publicVideoId, viewer)).status).toBe(403);
  });

  test("without a platform key it is a 503 platform_unavailable, and so is a platform that fails", async () => {
    setVideoPlatformForTests(null);
    try {
      const res = await lookup(IDS.publicVideoId);
      expect(res.status).toBe(503);
      expect(await codeOf(res)).toBe("platform_unavailable");
    } finally {
      setVideoPlatformForTests(
        createYoutubePlatform({
          apiKey: "wrong-key",
          fetch: recorded,
        }),
      );
    }
    const rejected = await lookup(IDS.publicVideoId);
    expect(rejected.status).toBe(503);
    expect(await codeOf(rejected)).toBe("platform_unavailable");
    setVideoPlatformForTests(
      createYoutubePlatform({
        apiKey: RECORDED_YOUTUBE_API_KEY,
        fetch: recorded,
      }),
    );
  });
});

describe("creating a sermon from a video", () => {
  test("a bad, private or missing video creates nothing: no sermon, link, series or revision", async () => {
    const before = await countRows();
    for (const [video, status, code] of [
      ["not a video", 422, "invalid_video_id"],
      [IDS.privateVideoId, 422, "video_private"],
      [IDS.missingVideoId, 404, "video_not_found"],
    ] as const) {
      const res = await createSermon({
        video,
        newSeriesTitle: `Serie ${RUN}`,
      });
      expect(res.status).toBe(status);
      expect(await codeOf(res)).toBe(code);
    }
    expect(await countRows()).toEqual(before);
  });

  test("a series that does not exist is a 400 invalid_series and creates nothing", async () => {
    const before = await countRows();
    const res = await createSermon({
      video: IDS.publicVideoId,
      seriesId: UNKNOWN_ID,
    });
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_series");
    expect(await countRows()).toEqual(before);
  });

  test("a valid video creates the sermon, its link and a preloaded draft in one go", async () => {
    const before = await countRows();
    const res = await createSermon({ video: VIDEO_URL });
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as CreateSermonResponse;
    expect(await countRows()).toEqual({
      sermons: before.sermons + 1,
      links: before.links + 1,
      series: before.series,
      revisions: before.revisions + 1,
    });

    const link = await db.platformLink.findFirstOrThrow({
      where: { organizationId, entityType: "SERMON", entityId: id },
    });
    expect(link).toMatchObject({
      platform: "YOUTUBE",
      externalId: IDS.publicVideoId,
      url: VIDEO_URL,
      durationSeconds: 3723,
      viewCount: 1523,
    });
    expect(link.fetchedAt).not.toBeNull();

    const revision = await db.contentRevision.findFirstOrThrow({
      where: { entityId: id, contentType: "SERMON" },
    });
    expect(revision.state).toBe("DRAFT");
    expect(await workingSnapshot(id)).toMatchObject({
      translations: {
        es: {
          title: "La fe que permanece | Serie Firmes en la tormenta",
          slug: "la-fe-que-permanece-serie-firmes-en-la-tormenta",
          summary: expect.stringContaining("Hebreos 11"),
        },
      },
      preachedOn: "2026-11-15",
    });

    const audit = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "sermon.created",
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.entityId).toBe(id);
  });

  test("the same video twice is a 409 video_already_linked and creates nothing", async () => {
    const before = await countRows();
    const res = await createSermon({ video: IDS.publicVideoId });
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("video_already_linked");
    expect(await countRows()).toEqual(before);

    const preview = await lookup(IDS.publicVideoId);
    expect(((await preview.json()) as PlatformLookupDto).alreadyLinked).toBe(
      true,
    );
  });

  test("the list shows the new sermon with its working draft, platform data and views", async () => {
    const item = (await listItems()).find(
      (candidate) => candidate.platform?.externalId === IDS.publicVideoId,
    );
    expect(item).toMatchObject({
      title: "La fe que permanece | Serie Firmes en la tormenta",
      preachedOn: "2026-11-15",
      preacher: null,
      series: null,
      live: null,
      working: { state: "draft" },
      platform: { platform: "youtube", viewCount: 1523, durationSeconds: 3723 },
    });
  });
});

describe("deleting a sermon", () => {
  test("a sermon that was never published is deleted with its link, and its video is free again", async () => {
    const item = (await listItems()).find(
      (candidate) => candidate.platform?.externalId === IDS.publicVideoId,
    );
    const id = item?.id ?? "";
    const res = await deleteSermon(id);
    expect(res.status).toBe(204);

    expect(await db.sermon.findUnique({ where: { id } })).toBeNull();
    expect(await db.platformLink.count({ where: { entityId: id } })).toBe(0);
    const revision = await db.contentRevision.findFirstOrThrow({
      where: { entityId: id, contentType: "SERMON" },
    });
    expect(revision.state).toBe("SUPERSEDED");
    expect(
      ((await (await lookup(IDS.publicVideoId)).json()) as PlatformLookupDto)
        .alreadyLinked,
    ).toBe(false);
    expect(
      await auditRowsOf({ entityId: id, action: "sermon.deleted" }),
    ).toHaveLength(1);
  });

  test("a published sermon cannot be deleted (409 sermon_live)", async () => {
    const created = await createSermon({ video: IDS.publicVideoId });
    const { id } = (await created.json()) as CreateSermonResponse;
    const published = await call("POST", `/editorial/sermon/${id}/publish`, {
      cookie: editor,
    });
    expect(published.status).toBe(200);
    expect(
      ((await published.json()) as EditorialStatusDto).live,
    ).not.toBeNull();

    const res = await deleteSermon(id);
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("sermon_live");
    expect(await db.sermon.findUnique({ where: { id } })).not.toBeNull();

    // A live sermon is never deleted through the API: free its video by hand for the next tests.
    await db.platformLink.deleteMany({ where: { entityId: id } });
    await db.sermon.delete({ where: { id } });
  });

  test("an unknown sermon is a 404", async () => {
    expect((await deleteSermon(UNKNOWN_ID)).status).toBe(404);
  });
});

describe("creating a sermon with a series", () => {
  test("newSeriesTitle creates a minimal series in the default language, and the sermon is its first", async () => {
    const before = await countRows();
    const res = await createSermon({
      video: IDS.publicVideoId,
      newSeriesTitle: `Serie de prueba ${RUN}`,
    });
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as CreateSermonResponse;
    expect(await countRows()).toEqual({
      sermons: before.sermons + 1,
      links: before.links + 1,
      series: before.series + 1,
      revisions: before.revisions + 1,
    });

    const series = await db.sermonSeries.findFirstOrThrow({
      where: {
        organizationId,
        translations: { some: { title: `Serie de prueba ${RUN}` } },
      },
      include: { translations: true },
    });
    expect(series.translations).toHaveLength(1);
    expect(series.translations[0]).toMatchObject({
      locale: "es",
      slug: `serie-de-prueba-${RUN}`,
    });
    expect(await workingSnapshot(id)).toMatchObject({
      seriesId: series.id,
      seriesOrder: 1,
    });
    const audit = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "sermonSeries.created",
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.entityId).toBe(series.id);

    const item = (await listItems()).find((candidate) => candidate.id === id);
    expect(item?.series).toEqual({
      id: series.id,
      title: `Serie de prueba ${RUN}`,
    });
  });
});

describe("channel suggestions", () => {
  test("lists the channel's recent public uploads that are not linked, and caches the read", async () => {
    await db.siteSettings.update({
      where: { organizationId },
      data: { youtubeChannelId: IDS.offlineChannelId },
    });
    clearPlatformSuggestionsCache();
    const before = recorded.requests.length;

    const first = await call("GET", "/content/platform/suggestions", {
      cookie: editor,
    });
    expect(first.status).toBe(200);
    const ids = ((await first.json()) as PlatformSuggestionListDto).items.map(
      (item) => item.externalId,
    );
    // The private upload is out, and so is the video the previous tests linked.
    expect(ids).toEqual([IDS.secondVideoId, "Ab3dEf5GhIj"]);
    expect(recorded.requests.length).toBe(before + 1);

    const sermon = await db.sermon.create({ data: { organizationId } });
    await db.platformLink.create({
      data: {
        organizationId,
        entityType: "SERMON",
        entityId: sermon.id,
        platform: "YOUTUBE",
        externalId: IDS.secondVideoId,
        url: `https://www.youtube.com/watch?v=${IDS.secondVideoId}`,
      },
    });
    const second = await call("GET", "/content/platform/suggestions", {
      cookie: podcastCreator,
    });
    expect(
      ((await second.json()) as PlatformSuggestionListDto).items.map(
        (item) => item.externalId,
      ),
    ).toEqual(["Ab3dEf5GhIj"]);
    // Linked a second ago and already gone from the list, without asking YouTube again.
    expect(recorded.requests.length).toBe(before + 1);
  });

  test("suggesting creates nothing, and with no channel there is nothing to suggest", async () => {
    const before = await countRows();
    await call("GET", "/content/platform/suggestions", { cookie: editor });
    expect(await countRows()).toEqual(before);

    await db.siteSettings.update({
      where: { organizationId },
      data: { youtubeChannelId: null },
    });
    const res = await call("GET", "/content/platform/suggestions", {
      cookie: editor,
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as PlatformSuggestionListDto).items).toEqual([]);
  });

  test("viewing sermons does not allow it, and without a platform key it is a 503", async () => {
    expect(
      (await call("GET", "/content/platform/suggestions", { cookie: viewer }))
        .status,
    ).toBe(403);
    setVideoPlatformForTests(null);
    try {
      const res = await call("GET", "/content/platform/suggestions", {
        cookie: editor,
      });
      expect(res.status).toBe(503);
      expect(await codeOf(res)).toBe("platform_unavailable");
    } finally {
      setVideoPlatformForTests(
        createYoutubePlatform({
          apiKey: RECORDED_YOUTUBE_API_KEY,
          fetch: recorded,
        }),
      );
    }
  });
});
