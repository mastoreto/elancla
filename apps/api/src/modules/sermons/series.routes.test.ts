import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type CreateSermonResponse,
  grant,
  PERMISSIONS,
  type SermonSeriesDto,
  type SermonSeriesListDto,
  type SermonSnapshot,
  type UpsertSermonSeriesBody,
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

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const RUN = crypto.randomUUID().slice(0, 8);
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

let organizationId = "";
let editor = "";
let viewer = "";
const seriesIds: string[] = [];
const sermonIds: string[] = [];
const mediaIds: string[] = [];

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  const auth = getAuth();
  const cookieOf = async (
    label: string,
    access: Parameters<typeof fixtures.passwordUser>[2],
  ) => fixtures.signIn(auth, await fixtures.passwordUser(auth, label, access));
  editor = await cookieOf("series-editor", [
    grant(PERMISSIONS.sermons.view),
    grant(PERMISSIONS.sermons.create),
    grant(PERMISSIONS.sermons.edit),
    grant(PERMISSIONS.sermons.publish),
  ]);
  viewer = await cookieOf("series-viewer", [grant(PERMISSIONS.sermons.view)]);
  setVideoPlatformForTests(
    createYoutubePlatform({
      apiKey: RECORDED_YOUTUBE_API_KEY,
      fetch: createRecordedYoutubeFetch(),
    }),
  );
});

afterAll(async () => {
  setVideoPlatformForTests(undefined);
  const links = await db.platformLink.findMany({
    where: { organizationId, externalId: IDS.publicVideoId },
    select: { entityId: true },
  });
  await db.platformLink.deleteMany({
    where: { organizationId, externalId: IDS.publicVideoId },
  });
  await db.sermon.deleteMany({
    where: {
      id: { in: [...sermonIds, ...links.map((link) => link.entityId)] },
    },
  });
  await db.sermonSeries.deleteMany({
    where: {
      OR: [
        { id: { in: seriesIds } },
        { translations: { some: { title: { contains: RUN } } } },
        { youtubePlaylistId: IDS.playlistId },
      ],
    },
  });
  await db.mediaFile.deleteMany({ where: { id: { in: mediaIds } } });
  await fixtures.cleanup();
});

const codeOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { code: string }).code;

const slugOf = (name: string): string => `test-${RUN}-${name}`;

const bodyFor = (
  name: string,
  overrides: Partial<UpsertSermonSeriesBody> = {},
): UpsertSermonSeriesBody => ({
  coverMediaId: null,
  plannedCount: null,
  order: 0,
  translations: {
    es: {
      title: `Serie ${name} ${RUN}`,
      slug: slugOf(name),
      description: null,
      tags: [],
    },
  },
  ...overrides,
});

async function createSeries(
  body: UpsertSermonSeriesBody,
  cookie = editor,
): Promise<Response> {
  const res = await call("POST", "/content/sermon-series", { cookie, body });
  if (res.status === 201) {
    seriesIds.push(((await res.clone().json()) as SermonSeriesDto).id);
  }
  return res;
}

async function listSeries(): Promise<SermonSeriesDto[]> {
  const res = await call("GET", "/content/sermon-series", { cookie: viewer });
  expect(res.status).toBe(200);
  return ((await res.json()) as SermonSeriesListDto).items;
}

async function makeSeries(name: string): Promise<SermonSeriesDto> {
  const res = await createSeries(bodyFor(name));
  expect(res.status).toBe(201);
  return (await res.json()) as SermonSeriesDto;
}

/** A sermon with a draft in the series; with `preachedOn` it is also published. */
async function sermonInSeries(
  seriesId: string,
  name: string,
  order: number,
  publishedOn?: string,
): Promise<string> {
  const sermon = await db.sermon.create({ data: { organizationId } });
  sermonIds.push(sermon.id);
  const snapshot: Partial<SermonSnapshot> = {
    translations: {
      es: { title: `Sermón ${name}`, slug: slugOf(`sermon-${name}`), tags: [] },
    },
    preachedOn: publishedOn ?? "2026-01-01",
    seriesId,
    seriesOrder: order,
  };
  const draft = await call("PUT", `/editorial/sermon/${sermon.id}/draft`, {
    cookie: editor,
    body: { snapshot },
  });
  expect(draft.status).toBe(200);
  if (publishedOn) {
    const published = await call(
      "POST",
      `/editorial/sermon/${sermon.id}/publish`,
      { cookie: editor },
    );
    expect(published.status).toBe(200);
  }
  return sermon.id;
}

describe("sermon series CRUD", () => {
  test("creates a series with its translations and an audit row, and lists it", async () => {
    const res = await createSeries(
      bodyFor("crud", {
        plannedCount: 8,
        order: 5,
        translations: {
          es: {
            title: `Serie crud ${RUN}`,
            slug: slugOf("crud"),
            description: "Una serie",
            tags: ["fe"],
          },
          en: {
            title: `Series crud ${RUN}`,
            slug: slugOf("crud-en"),
            description: null,
            tags: [],
          },
        },
      }),
    );
    expect(res.status).toBe(201);
    const created = (await res.json()) as SermonSeriesDto;
    expect(created).toMatchObject({
      version: 1,
      order: 5,
      plannedCount: 8,
      youtubePlaylistId: null,
      cover: null,
      sermonCount: 0,
      firstPreachedOn: null,
      lastPreachedOn: null,
    });
    expect(created.translations.es?.tags).toEqual(["fe"]);
    expect(await listSeries()).toContainEqual(created);

    const audit = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "sermonSeries.created",
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.entityId).toBe(created.id);
  });

  test("updates with the version read, bumps it and audits before and after", async () => {
    const series = await makeSeries("update");
    const res = await call("PATCH", `/content/sermon-series/${series.id}`, {
      cookie: editor,
      body: {
        ...bodyFor("update", { plannedCount: 4 }),
        translations: {
          es: {
            title: `Renombrada ${RUN}`,
            slug: slugOf("update"),
            description: "Nueva",
            tags: [],
          },
        },
        version: series.version,
      },
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as SermonSeriesDto;
    expect(updated.version).toBe(series.version + 1);
    expect(updated.translations.es?.title).toBe(`Renombrada ${RUN}`);
    expect(updated.plannedCount).toBe(4);

    const [row] = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "sermonSeries.updated",
    });
    expect(row?.entityId).toBe(series.id);
    expect(row?.before).not.toBeNull();
  });

  test("a stale version is a 409 stale_version and changes nothing", async () => {
    const series = await makeSeries("stale");
    const res = await call("PATCH", `/content/sermon-series/${series.id}`, {
      cookie: editor,
      body: { ...bodyFor("stale"), version: series.version + 7 },
    });
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("stale_version");
    expect(
      (await listSeries()).find((item) => item.id === series.id)?.version,
    ).toBe(series.version);
  });

  test("a slug another series uses in the same language is a 409 slug_taken; renaming itself is fine", async () => {
    const first = await makeSeries("slug-a");
    const second = await createSeries(
      bodyFor("slug-b", {
        translations: {
          es: {
            title: `Otra ${RUN}`,
            slug: slugOf("slug-a"),
            description: null,
            tags: [],
          },
        },
      }),
    );
    expect(second.status).toBe(409);
    expect(await codeOf(second)).toBe("slug_taken");

    const own = await call("PATCH", `/content/sermon-series/${first.id}`, {
      cookie: editor,
      body: { ...bodyFor("slug-a"), version: first.version },
    });
    expect(own.status).toBe(200);
  });

  test("the default language is required and only enabled languages are accepted", async () => {
    const noDefault = await createSeries(
      bodyFor("langs", {
        translations: {
          en: {
            title: `Only ${RUN}`,
            slug: slugOf("langs-en"),
            description: null,
            tags: [],
          },
        },
      }),
    );
    expect(noDefault.status).toBe(400);

    const notEnabled = await createSeries(
      bodyFor("langs", {
        translations: {
          es: {
            title: `Es ${RUN}`,
            slug: slugOf("langs"),
            description: null,
            tags: [],
          },
          fr: {
            title: `Fr ${RUN}`,
            slug: slugOf("langs-fr"),
            description: null,
            tags: [],
          },
        },
      }),
    );
    expect(notEnabled.status).toBe(400);
  });

  test("the cover must be a finished content image of the organization (400 invalid_media)", async () => {
    const mediaId = crypto.randomUUID();
    const pdf = await db.mediaFile.create({
      data: {
        id: mediaId,
        organizationId,
        purpose: "contentDocument",
        status: "ready",
        key: `${organizationId}/${mediaId}`,
        contentType: "application/pdf",
        size: 10,
        originalName: "a.pdf",
      },
    });
    mediaIds.push(pdf.id);
    const res = await createSeries(bodyFor("cover", { coverMediaId: pdf.id }));
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_media");
  });

  test("an unknown series is a 404, and a viewer cannot write", async () => {
    const patch = await call("PATCH", `/content/sermon-series/${UNKNOWN_ID}`, {
      cookie: editor,
      body: { ...bodyFor("ghost"), version: 1 },
    });
    expect(patch.status).toBe(404);
    expect(
      (
        await call("DELETE", `/content/sermon-series/${UNKNOWN_ID}`, {
          cookie: editor,
        })
      ).status,
    ).toBe(404);
    expect((await createSeries(bodyFor("viewer"), viewer)).status).toBe(403);
  });

  test("deletes logically with an audit row, and the slug is free again", async () => {
    const series = await makeSeries("delete");
    const res = await call("DELETE", `/content/sermon-series/${series.id}`, {
      cookie: editor,
    });
    expect(res.status).toBe(204);
    expect((await listSeries()).some((item) => item.id === series.id)).toBe(
      false,
    );
    const row = await db.sermonSeries.findUniqueOrThrow({
      where: { id: series.id },
    });
    expect(row.deletedAt).not.toBeNull();
    expect(
      await auditRowsOf({
        entityId: series.id,
        action: "sermonSeries.deleted",
      }),
    ).toHaveLength(1);
    expect((await createSeries(bodyFor("delete"))).status).toBe(201);
  });
});

describe("what a series computes from its live sermons", () => {
  test("count and date range come from the published sermons only, and the series is in use while any sermon points at it", async () => {
    const series = await makeSeries("computed");
    await sermonInSeries(series.id, "a", 1, "2026-03-15");
    await sermonInSeries(series.id, "b", 2, "2026-03-01");
    await sermonInSeries(series.id, "draft", 3);

    const computed = (await listSeries()).find((item) => item.id === series.id);
    expect(computed).toMatchObject({
      sermonCount: 2,
      firstPreachedOn: "2026-03-01",
      lastPreachedOn: "2026-03-15",
    });

    const res = await call("DELETE", `/content/sermon-series/${series.id}`, {
      cookie: editor,
    });
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("series_in_use");
  });

  test("a series only a draft points at is in use too", async () => {
    const series = await makeSeries("draft-only");
    await sermonInSeries(series.id, "only-draft", 1);
    const res = await call("DELETE", `/content/sermon-series/${series.id}`, {
      cookie: editor,
    });
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("series_in_use");
  });

  test("a series created along with a sermon is editable from the series screen", async () => {
    const created = await call("POST", "/content/sermons", {
      cookie: editor,
      body: {
        video: IDS.publicVideoId,
        newSeriesTitle: `Al vuelo ${RUN}`,
      },
    });
    expect(created.status).toBe(201);
    const { id: sermonId } = (await created.json()) as CreateSermonResponse;

    const series = (await listSeries()).find(
      (item) => item.translations.es?.title === `Al vuelo ${RUN}`,
    );
    expect(series).toBeDefined();
    const res = await call("PATCH", `/content/sermon-series/${series?.id}`, {
      cookie: editor,
      body: {
        coverMediaId: null,
        plannedCount: 6,
        order: 2,
        translations: {
          es: {
            title: `Al vuelo ${RUN}`,
            slug: series?.translations.es?.slug,
            description: "Completada",
            tags: [],
          },
        },
        version: series?.version,
      },
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as SermonSeriesDto).plannedCount).toBe(6);
    const revision = await db.contentRevision.findFirstOrThrow({
      where: { entityId: sermonId, contentType: "SERMON" },
    });
    expect((revision.snapshot as unknown as SermonSnapshot).seriesId).toBe(
      series?.id,
    );
  });
});

describe("importing a series from a playlist", () => {
  test("creates the linked series preloaded in the default language, without sermons", async () => {
    const sermonsBefore = await db.sermon.count({ where: { organizationId } });
    const res = await call("POST", "/content/sermon-series/import", {
      cookie: editor,
      body: {
        playlist: `https://www.youtube.com/playlist?list=${IDS.playlistId}`,
      },
    });
    expect(res.status).toBe(201);
    const imported = (await res.json()) as SermonSeriesDto;
    seriesIds.push(imported.id);
    expect(imported).toMatchObject({
      youtubePlaylistId: IDS.playlistId,
      cover: null,
      sermonCount: 0,
      translations: {
        es: {
          title: "Firmes en la tormenta",
          description: "Serie sobre la fe en tiempos difíciles.",
        },
      },
    });
    expect(await db.sermon.count({ where: { organizationId } })).toBe(
      sermonsBefore,
    );
    const audit = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "sermonSeries.imported",
    });
    expect(audit).toHaveLength(1);
  });

  test("the same playlist twice is a 409, until the series is deleted", async () => {
    const again = await call("POST", "/content/sermon-series/import", {
      cookie: editor,
      body: { playlist: IDS.playlistId },
    });
    expect(again.status).toBe(409);
    expect(await codeOf(again)).toBe("playlist_already_imported");

    const imported = (await listSeries()).find(
      (item) => item.youtubePlaylistId === IDS.playlistId,
    );
    await call("DELETE", `/content/sermon-series/${imported?.id}`, {
      cookie: editor,
    });
    const reimported = await call("POST", "/content/sermon-series/import", {
      cookie: editor,
      body: { playlist: IDS.playlistId },
    });
    expect(reimported.status).toBe(201);
    seriesIds.push(((await reimported.json()) as SermonSeriesDto).id);
  });

  test("an invalid or missing playlist is a clear error and creates nothing", async () => {
    const before = await db.sermonSeries.count({ where: { organizationId } });
    const invalid = await call("POST", "/content/sermon-series/import", {
      cookie: editor,
      body: { playlist: "https://example.com/list" },
    });
    expect(invalid.status).toBe(422);
    expect(await codeOf(invalid)).toBe("invalid_playlist_id");

    const missing = await call("POST", "/content/sermon-series/import", {
      cookie: editor,
      body: { playlist: IDS.missingPlaylistId },
    });
    expect(missing.status).toBe(404);
    expect(await codeOf(missing)).toBe("playlist_not_found");
    expect(await db.sermonSeries.count({ where: { organizationId } })).toBe(
      before,
    );
  });

  test("without a platform key it is a 503 platform_unavailable", async () => {
    setVideoPlatformForTests(null);
    try {
      const res = await call("POST", "/content/sermon-series/import", {
        cookie: editor,
        body: { playlist: IDS.playlistId },
      });
      expect(res.status).toBe(503);
      expect(await codeOf(res)).toBe("platform_unavailable");
    } finally {
      setVideoPlatformForTests(
        createYoutubePlatform({
          apiKey: RECORDED_YOUTUBE_API_KEY,
          fetch: createRecordedYoutubeFetch(),
        }),
      );
    }
  });
});
