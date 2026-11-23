import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type PublicSermonDto,
  type PublicSermonIndexDto,
  publicSermonDto,
  publicSermonIndexDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createSermonWorld,
  type SermonWorld,
} from "../../../test/support/sermonWorld";
import { getStorageEnv } from "../../core/storage";
import { PUBLIC_CACHE_CONTROL } from "./public.routes";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

let world: SermonWorld;
let coverId = "";
let pdfId = "";
let hiddenPdfId = "";
const ids: Record<string, string> = {};

const auth = () => ({ Authorization: `Bearer ${world.key}` });
const get = (path: string, query = "") =>
  call("GET", `/public/v1/${world.slug}/sermons${path}${query}`, {
    headers: auth(),
  });
const indexOf = async (query = ""): Promise<PublicSermonIndexDto> => {
  const res = await get("", query);
  expect(res.status).toBe(200);
  return publicSermonIndexDto.parse(await res.json());
};
const sermonOf = async (slug: string, query = ""): Promise<PublicSermonDto> => {
  const res = await get(`/${slug}`, query);
  expect(res.status).toBe(200);
  return publicSermonDto.parse(await res.json());
};

/** Keys and values that would leak an internal id (the YouTube `videoId` is external, not one). */
function findLeaks(value: unknown, path = "$"): string[] {
  if (typeof value === "string") return UUID_PATTERN.test(value) ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findLeaks(item, `${path}[${index}]`));
  }
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => {
    // Public file URLs carry the file's key by design; they are addresses, not ids.
    if (key === "url") return [];
    const own =
      /^id$|Id$/.test(key) && key !== "videoId" ? [`${path}.${key}`] : [];
    return [...own, ...findLeaks(child, `${path}.${key}`)];
  });
}

beforeAll(async () => {
  world = await createSermonWorld(fixtures);
  coverId = await world.createMedia("contentImage");
  pdfId = await world.createMedia("contentDocument", {
    name: "guia.pdf",
    size: 4096,
  });
  hiddenPdfId = await world.createMedia("contentDocument", {
    status: "pending",
  });
  const { seriesId, preacherId, secondPreacherId } = world;
  ids.s1 = await world.createSermon({
    slugs: { es: "uno", en: "one" },
    preachedOn: "2026-03-01",
    videoId: "vidAAAAAAA1",
    seriesId,
    seriesOrder: 1,
    preacherProfileId: preacherId,
    passages: [
      { book: "Heb", chapter: 1 },
      { book: "Gen", chapter: 1, verseFrom: 1, verseTo: 3 },
    ],
    tags: ["fe"],
    withNotes: true,
    coverMediaId: coverId,
    attachmentMediaIds: [hiddenPdfId, pdfId],
  });
  ids.s2 = await world.createSermon({
    slugs: { es: "dos" },
    preachedOn: "2026-03-08",
    videoId: "vidAAAAAAA2",
    seriesId,
    seriesOrder: 2,
    preacherProfileId: preacherId,
    passages: [{ book: "Heb", chapter: 2 }],
    featured: true,
  });
  ids.s3 = await world.createSermon({
    slugs: { es: "tres", en: "three" },
    preachedOn: "2026-03-15",
    videoId: "vidAAAAAAA3",
    seriesId,
    seriesOrder: 3,
    preacherProfileId: secondPreacherId,
    passages: [{ book: "Heb", chapter: 3 }],
    thumbnailUrl: null,
    durationSeconds: null,
    platformPublishedAt: null,
  });
  ids.loose = await world.createSermon({
    slugs: { es: "suelto" },
    preachedOn: "2026-02-01",
    videoId: "vidAAAAAAA4",
  });
  ids.draft = await world.createSermon({
    slugs: { es: "borrador" },
    preachedOn: "2026-04-01",
    videoId: "vidAAAAAAA5",
    state: "DRAFT",
    seriesId: world.emptySeriesId,
    seriesOrder: 1,
    passages: [{ book: "Rev", chapter: 1 }],
  });
  ids.paused = await world.createSermon({
    slugs: { es: "pausado" },
    preachedOn: "2026-04-02",
    videoId: "vidAAAAAAA6",
    state: "PAUSED",
  });
});

afterAll(async () => {
  await db.platformLink.deleteMany({
    where: { organizationId: world.organizationId },
  });
  await db.mediaFile.deleteMany({
    where: { organizationId: world.organizationId },
  });
  await fixtures.cleanup();
});

describe("GET /public/v1/:churchSlug/sermons", () => {
  test("needs the site key of the church", async () => {
    const res = await call("GET", `/public/v1/${world.slug}/sermons`);
    expect(res.status).toBe(401);
    const other = await call("GET", `/public/v1/other-church/sermons`, {
      headers: auth(),
    });
    expect(other.status).toBe(401);
  });

  test("lists only published sermons, newest preached first, with the public cache header", async () => {
    const res = await get("");
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const index = publicSermonIndexDto.parse(await res.json());
    expect(index.locale).toBe("es");
    expect(index.sermons.map(({ slug }) => slug)).toEqual([
      "tres",
      "dos",
      "uno",
      "suelto",
    ]);
  });

  test("shows the platform data, the series, the preacher and the passages of each sermon", async () => {
    const index = await indexOf();
    const one = index.sermons.find(({ slug }) => slug === "uno");
    expect(one).toMatchObject({
      videoId: "vidAAAAAAA1",
      durationSeconds: 3600,
      preachedOn: "2026-03-01",
      series: { slug: "hebreos", title: "Hebreos", order: 1 },
      preacher: { name: "Pablo Predicador" },
      tags: ["fe"],
      passages: [
        {
          book: "Heb",
          chapter: 1,
          verseFrom: null,
          chapterTo: null,
          verseTo: null,
        },
        { book: "Gen", chapter: 1, verseFrom: 1, chapterTo: null, verseTo: 3 },
      ],
    });
    const loose = index.sermons.find(({ slug }) => slug === "suelto");
    expect(loose).toMatchObject({ series: null, preacher: null, passages: [] });
  });

  test("an own cover replaces the thumbnail of the platform; without either there is none", async () => {
    const index = await indexOf();
    const bySlug = (slug: string) =>
      index.sermons.find((sermon) => sermon.slug === slug);
    const own = bySlug("uno")?.cover;
    expect(own?.kind).toBe("image");
    if (own?.kind === "image") {
      // Only webp variants are exposed.
      expect(
        own.images.map(({ width }) => width).sort((a, b) => a - b),
      ).toEqual([640, 1280]);
      expect(own.images[0]?.url).toStartWith(
        getStorageEnv().MEDIA_PUBLIC_BASE_URL,
      );
    }
    expect(bySlug("dos")?.cover).toEqual({
      kind: "thumbnail",
      url: "https://i.ytimg.com/vi/vidAAAAAAA2/hqdefault.jpg",
    });
    expect(bySlug("tres")?.cover).toBeNull();
  });

  test("the featured sermon is the flagged one, otherwise the newest", async () => {
    expect((await indexOf()).featured?.slug).toBe("dos");
    await db.contentRevision.updateMany({
      where: { entityId: ids.s2 },
      data: { snapshot: await withFeatured(ids.s2 as string, false) },
    });
    expect((await indexOf()).featured?.slug).toBe("tres");
    await db.contentRevision.updateMany({
      where: { entityId: ids.s2 },
      data: { snapshot: await withFeatured(ids.s2 as string, true) },
    });
  });

  test("series count and range come from the live sermons only", async () => {
    const { series } = await indexOf();
    expect(series).toEqual([
      {
        slug: "hebreos",
        title: "Hebreos",
        description: "Un estudio",
        cover: null,
        count: 3,
        firstPreachedOn: "2026-03-01",
        lastPreachedOn: "2026-03-15",
      },
    ]);
  });

  test("preachers and books are counted over the published sermons, books in canonical order", async () => {
    const { preachers, books } = await indexOf();
    expect(preachers).toEqual([
      { name: "Pablo Predicador", count: 2 },
      { name: "Ana Anciana", count: 1 },
    ]);
    expect(books).toEqual([
      { book: "Gen", count: 1 },
      { book: "Heb", count: 3 },
    ]);
  });

  test("falls back to the default language when the sermon has no translation", async () => {
    const index = await indexOf("?locale=en");
    expect(index.locale).toBe("en");
    const bySlug = Object.fromEntries(
      index.sermons.map((sermon) => [sermon.slug, sermon]),
    );
    expect(bySlug.one?.locale).toBe("en");
    expect(bySlug.three?.locale).toBe("en");
    expect(bySlug.dos?.locale).toBe("es");
    expect(bySlug.one?.series?.title).toBe("Hebrews");
    expect(bySlug.dos?.series?.title).toBe("Hebrews");
    // A language the church does not serve is the default one.
    expect((await indexOf("?locale=pt")).locale).toBe("es");
  });

  test("rejects a malformed locale", async () => {
    expect((await get("", "?locale=xx-yy-zz")).status).toBe(400);
  });

  test("exposes no id and no view count", async () => {
    const res = await get("");
    const text = await res.text();
    expect(text).not.toContain("viewCount");
    expect(text).not.toContain("12345");
    expect(findLeaks(JSON.parse(text))).toEqual([]);
  });

  test("a church with no sermons has an empty index", async () => {
    const empty = await fixtures.createOrganization("sermon-empty");
    const { key } = await fixtures.createSiteKey(empty.id);
    const res = await call("GET", `/public/v1/${empty.slug}/sermons`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    expect(publicSermonIndexDto.parse(await res.json())).toEqual({
      locale: "es",
      sermons: [],
      featured: null,
      series: [],
      preachers: [],
      books: [],
    });
  });
});

/** The snapshot of the sermon's revision with `featured` changed. */
async function withFeatured(sermonId: string, featured: boolean) {
  const row = await db.contentRevision.findFirstOrThrow({
    where: { entityId: sermonId },
    select: { snapshot: true },
  });
  return { ...(row.snapshot as Record<string, unknown>), featured };
}

describe("GET /public/v1/:churchSlug/sermons/:slug", () => {
  test("returns the sermon with the platform data, the rich text and the cache header", async () => {
    const res = await get("/uno");
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const sermon = publicSermonDto.parse(await res.json());
    expect(sermon).toMatchObject({
      slug: "uno",
      title: "Título uno",
      locale: "es",
      videoId: "vidAAAAAAA1",
      durationSeconds: 3600,
      uploadedAt: "2026-02-01T12:00:00.000Z",
      preacher: { name: "Pablo Predicador" },
      series: { slug: "hebreos", order: 1 },
      alternates: { es: "uno", en: "one" },
    });
    expect(sermon.modifiedAt).not.toBeNull();
    expect(sermon.preacherNotes).not.toBeNull();
    expect(sermon.outline).not.toBeNull();
    expect(sermon.cover?.kind).toBe("image");
  });

  test("adds the neighbours of the series in series order", async () => {
    const first = await sermonOf("uno");
    expect(first.previous).toBeNull();
    expect(first.next?.slug).toBe("dos");
    const middle = await sermonOf("dos");
    expect(middle.previous?.slug).toBe("uno");
    expect(middle.next?.slug).toBe("tres");
    const last = await sermonOf("tres");
    expect(last.previous?.slug).toBe("dos");
    expect(last.next).toBeNull();
    const loose = await sermonOf("suelto");
    expect(loose).toMatchObject({ previous: null, next: null, series: null });
  });

  test("lists only the ready PDFs, with a public URL, name and size", async () => {
    const { attachments } = await sermonOf("uno");
    expect(attachments).toEqual([
      {
        url: `${getStorageEnv().MEDIA_PUBLIC_BASE_URL}/${world.organizationId}/${pdfId}/document.pdf`,
        name: "guia.pdf",
        sizeBytes: 4096,
      },
    ]);
    expect((await sermonOf("dos")).attachments).toEqual([]);
  });

  test("a platform without data leaves the optional fields null", async () => {
    const sermon = await sermonOf("tres");
    expect(sermon).toMatchObject({
      durationSeconds: null,
      uploadedAt: null,
      cover: null,
    });
  });

  test("answers to the slug of any language and serves the requested one", async () => {
    const inEnglish = await sermonOf("one", "?locale=en");
    expect(inEnglish).toMatchObject({ slug: "one", locale: "en" });
    const bySpanishSlug = await sermonOf("uno", "?locale=en");
    expect(bySpanishSlug).toMatchObject({ slug: "one", locale: "en" });
    // Asked in Spanish by the English slug: served in Spanish, with both slugs as alternates.
    const asked = await sermonOf("one");
    expect(asked).toMatchObject({ slug: "uno", locale: "es" });
    expect(asked.alternates).toEqual({ es: "uno", en: "one" });
  });

  test("falls back to the default language when the sermon has no translation", async () => {
    const sermon = await sermonOf("dos", "?locale=en");
    expect(sermon).toMatchObject({ slug: "dos", locale: "es" });
  });

  test("drafts, paused and unknown sermons are the same 404", async () => {
    for (const slug of ["borrador", "pausado", "no-existe"]) {
      const res = await get(`/${slug}`);
      expect(res.status).toBe(404);
    }
  });

  test("a series that is deleted is not shown", async () => {
    await db.sermonSeries.update({
      where: { id: world.seriesId },
      data: { deletedAt: new Date() },
    });
    try {
      const sermon = await sermonOf("uno");
      expect(sermon.series).toBeNull();
      expect((await indexOf()).series).toEqual([]);
    } finally {
      await db.sermonSeries.update({
        where: { id: world.seriesId },
        data: { deletedAt: null },
      });
    }
  });

  test("exposes no id and no view count", async () => {
    const res = await get("/uno");
    const text = await res.text();
    expect(text).not.toContain("viewCount");
    expect(findLeaks(JSON.parse(text))).toEqual([]);
  });

  test("needs the site key", async () => {
    const res = await call("GET", `/public/v1/${world.slug}/sermons/uno`);
    expect(res.status).toBe(401);
  });
});
