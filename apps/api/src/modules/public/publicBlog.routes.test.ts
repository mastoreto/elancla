import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type PublicBlogIndexDto,
  type PublicPostDto,
  publicBlogIndexDto,
  publicPostDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import {
  type BlogWorld,
  blogBody,
  createBlogWorld,
  heading,
  paragraph,
} from "../../../test/support/blogWorld";
import { createFixtures } from "../../../test/support/fixtures";
import { PUBLIC_CACHE_CONTROL } from "./public.routes";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

let world: BlogWorld;
const ids: Record<string, string> = {};

const get = (path: string, query = "") =>
  call("GET", `/public/v1/${world.slug}/posts${path}${query}`, {
    headers: { Authorization: `Bearer ${world.key}` },
  });
const indexOf = async (query = ""): Promise<PublicBlogIndexDto> =>
  publicBlogIndexDto.parse(await (await get("", query)).json());
const postOf = async (slug: string, query = ""): Promise<PublicPostDto> => {
  const res = await get(`/${slug}`, query);
  expect(res.status).toBe(200);
  return publicPostDto.parse(await res.json());
};

/** Keys and values that would leak an internal id; the table of contents' anchors are not ids. */
function findLeaks(value: unknown, path = "$"): string[] {
  if (typeof value === "string") return UUID_PATTERN.test(value) ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findLeaks(item, `${path}[${index}]`));
  }
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => {
    if (key === "toc") return [];
    const own = /^id$|Id$/.test(key) ? [`${path}.${key}`] : [];
    return [...own, ...findLeaks(child, `${path}.${key}`)];
  });
}

beforeAll(async () => {
  world = await createBlogWorld(fixtures);
  const { categoryA, categoryB, seriesId } = world;
  ids.p1 = await world.createPost({
    slugs: { es: "uno", en: "one" },
    categoryId: categoryA,
    seriesId,
    seriesOrder: 1,
    featured: true,
    tags: ["fe", "ancla"],
    firstLiveAt: new Date("2026-03-10T15:00:00Z"),
    body: blogBody(
      paragraph("Primera parte"),
      heading("Una esperanza"),
      paragraph("Texto"),
      heading("Una esperanza"),
      paragraph("Más texto"),
    ),
  });
  ids.p2 = await world.createPost({
    slugs: { es: "dos" },
    categoryId: categoryA,
    seriesId,
    seriesOrder: 2,
    tags: ["fe"],
    firstLiveAt: new Date("2026-04-15T15:00:00Z"),
  });
  ids.p3 = await world.createPost({
    slugs: { es: "tres" },
    categoryId: categoryB,
    relatedPostIds: [ids.p1 as string],
    tags: ["estudio"],
    firstLiveAt: new Date("2026-05-20T15:00:00Z"),
  });
  const scheduledAt = world.daysFromNow(7);
  ids.scheduled = await world.createPost({
    slugs: { es: "pronto" },
    categoryId: categoryA,
    seriesId,
    seriesOrder: 3,
    firstLiveAt: scheduledAt,
    publishAt: scheduledAt.toISOString(),
  });
  ids.draft = await world.createPost({
    slugs: { es: "borrador" },
    categoryId: categoryB,
    firstLiveAt: null,
    state: "DRAFT",
  });
  ids.paused = await world.createPost({
    slugs: { es: "pausado" },
    categoryId: categoryB,
    firstLiveAt: new Date("2026-02-01T15:00:00Z"),
    state: "PAUSED",
  });
  const { date } = world.today();
  const longAgo = new Date(date.getTime() - 40 * 86_400_000);
  await db.postViewDaily.createMany({
    data: [
      { postId: ids.p2 as string, day: date, count: 5 },
      { postId: ids.p1 as string, day: date, count: 3 },
      { postId: ids.p3 as string, day: longAgo, count: 100 },
    ],
  });
});

afterAll(async () => {
  await fixtures.cleanup();
});

describe("public blog: what is visible", () => {
  test("drafts, paused and scheduled posts are absent from the index; the others are listed", async () => {
    const res = await get("");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const index = publicBlogIndexDto.parse(await res.json());
    expect(index.posts.map((post) => post.slug)).toEqual([
      "tres",
      "dos",
      "uno",
    ]);
    expect(index.featured?.slug).toBe("uno");
  });

  test("a draft, a paused and a scheduled post are 404; an unknown slug too", async () => {
    for (const slug of ["borrador", "pausado", "pronto", "nada"]) {
      expect((await get(`/${slug}`)).status, slug).toBe(404);
    }
  });

  test("the scheduled post shows in its series as `next`, with title and date only", async () => {
    const { series } = await indexOf();
    const items = series[0]?.items ?? [];
    expect(items.map((item) => item.state)).toEqual([
      "published",
      "published",
      "next",
    ]);
    const next = items[2];
    expect(next?.title).toBe("Título pronto");
    expect(next?.slug).toBeNull();
    expect(next?.urlDate).toBeNull();
    expect(next?.readingMinutes).toBeNull();
    expect(JSON.stringify(series)).not.toContain('"pronto"');
  });

  test("the key of the church is required", async () => {
    const res = await call("GET", `/public/v1/${world.slug}/posts`);
    expect(res.status).toBe(401);
  });
});

describe("public blog: index", () => {
  test("counts only visible posts per category, in the category order", async () => {
    const { categories } = await indexOf();
    expect(categories).toEqual([
      { slug: "reflexion", name: "Reflexión", count: 2 },
      { slug: "estudio", name: "Estudio", count: 1 },
    ]);
  });

  test("the archive groups visible posts by the month of their URL date", async () => {
    const { archive } = await indexOf();
    expect(archive).toEqual([
      { year: 2026, month: 5, count: 1 },
      { year: 2026, month: 4, count: 1 },
      { year: 2026, month: 3, count: 1 },
    ]);
  });

  test("popular follows the views of the last 30 days and carries no counts", async () => {
    const index = await indexOf();
    expect(index.popular.map((post) => post.slug)).toEqual(["dos", "uno"]);
    const serialized = JSON.stringify(index);
    expect(serialized).not.toMatch(/views|count":(5|3|100)\b/i);
  });

  test("tags are counted over visible posts", async () => {
    const { tags } = await indexOf();
    expect(tags).toEqual([
      { tag: "fe", count: 2 },
      { tag: "ancla", count: 1 },
      { tag: "estudio", count: 1 },
    ]);
  });

  test("each summary carries issue, date, reading time, category and author name", async () => {
    const { posts } = await indexOf();
    const first = posts.find((post) => post.slug === "uno");
    expect(first).toMatchObject({
      issue: 1,
      urlDate: "2026-03-10",
      readingMinutes: 1,
      category: { slug: "reflexion", name: "Reflexión" },
      authorName: "Ana Autora",
      cover: { kind: "design", glyph: "anchor", tint: "paper" },
    });
    expect(posts.map((post) => post.issue)).toEqual([3, 2, 1]);
  });

  test("the index carries no internal id", async () => {
    expect(findLeaks(await indexOf())).toEqual([]);
  });

  test("the requested language is used when the post has it, the default otherwise", async () => {
    const { posts, locale } = await indexOf("?locale=en");
    expect(locale).toBe("en");
    const bySlug = new Map(posts.map((post) => [post.slug, post]));
    expect(bySlug.get("one")?.locale).toBe("en");
    expect(bySlug.get("one")?.category.name).toBe("Reflection");
    expect(bySlug.get("dos")?.locale).toBe("es");
    expect(bySlug.get("dos")?.category.name).toBe("Reflection");
  });
});

describe("public blog: detail", () => {
  test("has the table of contents with unique anchors, reading time, issue and URL date", async () => {
    const post = await postOf("uno");
    expect(post.toc.map((entry) => entry.text)).toEqual([
      "Una esperanza",
      "Una esperanza",
    ]);
    expect(new Set(post.toc.map((entry) => entry.id)).size).toBe(2);
    expect(post.readingMinutes).toBe(1);
    expect(post.wordCount).toBeGreaterThan(0);
    expect(post.issue).toBe(1);
    expect(post.urlDate).toBe("2026-03-10");
    expect(post.publishedAt).toBe("2026-03-10T15:00:00.000Z");
    expect(post.body.type).toBe("doc");
    expect(post.alternates).toEqual({ es: "uno", en: "one" });
  });

  test("the author card shows its profile, stats and visible article count", async () => {
    const { author } = await postOf("uno");
    expect(author).toEqual({
      name: "Ana Autora",
      initials: "AA",
      profile: {
        photo: null,
        bio: "Bio de Ana",
        title: "Pastora",
        stats: [{ label: "Artículos", value: "12" }],
        articleCount: 3,
      },
    });
  });

  test("a hidden BLOG_AUTHOR role leaves only the name", async () => {
    await db.personRole.updateMany({
      where: { personProfileId: world.authorId, context: "BLOG_AUTHOR" },
      data: { visible: false },
    });
    try {
      expect((await postOf("uno")).author.profile).toBeNull();
      expect((await postOf("uno")).author.name).toBe("Ana Autora");
    } finally {
      await db.personRole.updateMany({
        where: { personProfileId: world.authorId, context: "BLOG_AUTHOR" },
        data: { visible: true },
      });
    }
  });

  test("related posts: manual first, then series, category and the most recent", async () => {
    // "dos": no manual ones; same series -> "uno"; then the most recent visible -> "tres".
    expect((await postOf("dos")).related.map((post) => post.slug)).toEqual([
      "uno",
      "tres",
    ]);
    // "tres": manual "uno" first, completed with the rest ("dos").
    expect((await postOf("tres")).related.map((post) => post.slug)).toEqual([
      "uno",
      "dos",
    ]);
  });

  test("previous and next are the neighbours in time among visible posts", async () => {
    const middle = await postOf("dos");
    expect(middle.previous?.slug).toBe("uno");
    expect(middle.next?.slug).toBe("tres");
    expect((await postOf("uno")).previous).toBeNull();
    expect((await postOf("tres")).next).toBeNull();
  });

  test("the series marks the post being read as current and the scheduled one as next", async () => {
    const { series } = await postOf("dos");
    expect(series?.name).toBe("Hebreos");
    expect(series?.items.map((item) => item.state)).toEqual([
      "published",
      "current",
      "next",
    ]);
  });

  test("any slug of the post opens it; the language falls back to the default one", async () => {
    const english = await postOf("one", "?locale=en");
    expect(english.locale).toBe("en");
    expect(english.slug).toBe("one");
    expect((await postOf("uno", "?locale=en")).slug).toBe("one");
    const fallback = await postOf("dos", "?locale=en");
    expect(fallback.locale).toBe("es");
    expect(fallback.slug).toBe("dos");
  });

  test("a locale the church does not serve falls back to the default one", async () => {
    expect((await postOf("uno", "?locale=pt")).locale).toBe("es");
  });

  test("carries no internal id and no view count", async () => {
    for (const slug of ["uno", "dos", "tres"]) {
      const post = await postOf(slug);
      expect(findLeaks(post), slug).toEqual([]);
      expect(JSON.stringify(post)).not.toMatch(/views/i);
    }
  });
});

describe("public blog: images", () => {
  const readyVariants = [
    { width: 480, height: 320, format: "webp", key: "k/480.webp", size: 1 },
    { width: 1280, height: 853, format: "webp", key: "k/1280.webp", size: 1 },
  ];
  let imageWorld: BlogWorld;

  const mediaFile = async (status: "ready" | "pending", ownerId: string) => {
    const id = crypto.randomUUID();
    await db.mediaFile.create({
      data: {
        id,
        organizationId: ownerId,
        purpose: "contentImage",
        status,
        key: `${ownerId}/${id}`,
        contentType: "image/webp",
        size: 10,
        originalName: "x.webp",
        variants: status === "ready" ? readyVariants : [],
      },
    });
    return id;
  };

  const getImagePost = async (slug: string): Promise<PublicPostDto> => {
    const res = await call(
      "GET",
      `/public/v1/${imageWorld.slug}/posts/${slug}`,
      { headers: { Authorization: `Bearer ${imageWorld.key}` } },
    );
    expect(res.status).toBe(200);
    return publicPostDto.parse(await res.json());
  };

  beforeAll(async () => {
    imageWorld = await createBlogWorld(fixtures);
    const ready = await mediaFile("ready", imageWorld.organizationId);
    const pending = await mediaFile("pending", imageWorld.organizationId);
    const figure = (mediaId: string) => ({
      type: "figure",
      attrs: { mediaId, alt: "Una foto", aspect: "wide" },
    });
    await imageWorld.createPost({
      slugs: { es: "con-fotos" },
      categoryId: imageWorld.categoryA,
      firstLiveAt: new Date("2026-03-10T15:00:00Z"),
      body: blogBody(paragraph("Hola"), figure(ready), figure(pending)),
      cover: { kind: "photo", mediaId: ready, alt: "Portada" },
    });
    await imageWorld.createPost({
      slugs: { es: "portada-pendiente" },
      categoryId: imageWorld.categoryA,
      firstLiveAt: new Date("2026-03-11T15:00:00Z"),
      cover: { kind: "photo", mediaId: pending, alt: "Portada" },
    });
  });

  afterAll(async () => {
    // Media files restrict the deletion of their organization.
    await db.mediaFile.deleteMany({
      where: { organizationId: imageWorld.organizationId },
    });
  });

  test("a ready cover and figure become the widest image; a figure that is not ready is omitted", async () => {
    const post = await getImagePost("con-fotos");
    const image = {
      url: expect.stringMatching(/\/k\/1280\.webp$/),
      width: 1280,
      height: 853,
    };
    expect(post.cover).toEqual({ kind: "photo", alt: "Portada", image });
    const figures = post.body.content.filter(
      (block) => block.type === "figure",
    );
    expect(figures).toHaveLength(1);
    expect(figures[0]).toEqual({
      type: "figure",
      attrs: { image, alt: "Una foto", aspect: "wide" },
    });
  });

  test("a cover photo that is not ready is null", async () => {
    expect((await getImagePost("portada-pendiente")).cover).toBeNull();
  });
});
