import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  type CategoryDto,
  type CreatePostResponse,
  type EditorialStatusDto,
  grant,
  PERMISSIONS,
  type PostListDto,
  type SeriesDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

interface TestUser {
  id: string;
  cookie: string;
}

let organizationId = "";
let admin: TestUser;
let creator: TestUser;
let viewer: TestUser;
let publisher: TestUser;
let authorId = "";
let categoryId = "";
const postIds: string[] = [];
const categoryIds: string[] = [];
const seriesIds: string[] = [];
const mediaIds: string[] = [];
const personIds: string[] = [];

const suffix = crypto.randomUUID().slice(0, 8);
const slugOf = (name: string): string => `${name}-${suffix}`;

async function makeUser(
  label: string,
  access: Parameters<typeof fixtures.passwordUser>[2],
): Promise<TestUser> {
  const auth = getAuth();
  const email = await fixtures.passwordUser(auth, label, access);
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  return { id: user.id, cookie: await fixtures.signIn(auth, email) };
}

async function makeAuthor(
  forOrganizationId: string,
  context: "BLOG_AUTHOR" | "TEAM",
): Promise<string> {
  const person = await db.personProfile.create({
    data: {
      organizationId: forOrganizationId,
      name: `Blog test ${suffix} ${context}`,
      roles: { create: [{ context }] },
    },
  });
  personIds.push(person.id);
  return person.id;
}

async function makeMedia(
  forOrganizationId: string,
  overrides: {
    purpose?: "contentImage" | "voucherDocument";
    status?: "ready" | "pending";
  } = {},
): Promise<string> {
  const id = crypto.randomUUID();
  await db.mediaFile.create({
    data: {
      id,
      organizationId: forOrganizationId,
      purpose: overrides.purpose ?? "contentImage",
      status: overrides.status ?? "ready",
      key: `${forOrganizationId}/${id}`,
      contentType: "image/webp",
      size: 10,
      originalName: "blog-test.webp",
    },
  });
  mediaIds.push(id);
  return id;
}

const jsonOf = async <T>(res: Response): Promise<T> => (await res.json()) as T;
const codeOf = async (res: Response): Promise<string> =>
  (await jsonOf<{ code: string }>(res)).code;

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  admin = await makeUser("blog-admin", ["admin"]);
  creator = await makeUser("blog-creator", [
    grant(PERMISSIONS.blogPosts.view),
    grant(PERMISSIONS.blogPosts.create),
    grant(PERMISSIONS.blogPosts.edit),
  ]);
  viewer = await makeUser("blog-viewer", [grant(PERMISSIONS.blogPosts.view)]);
  publisher = await makeUser("blog-publisher", [
    grant(PERMISSIONS.blogPosts.view),
    grant(PERMISSIONS.blogPosts.edit),
    grant(PERMISSIONS.blogPosts.publish),
  ]);
  authorId = await makeAuthor(organizationId, "BLOG_AUTHOR");
  categoryId = (await createCategory({ es: ["Cat base", slugOf("cat-base")] }))
    .id;
});

beforeEach(async () => {
  await db.editorialSettings.deleteMany({
    where: { organizationId, contentType: "BLOG_POST" },
  });
});

afterAll(async () => {
  await db.editorialSettings.deleteMany({
    where: { organizationId, contentType: "BLOG_POST" },
  });
  await db.post.deleteMany({ where: { id: { in: postIds } } });
  await db.category.deleteMany({ where: { id: { in: categoryIds } } });
  await db.series.deleteMany({ where: { id: { in: seriesIds } } });
  await db.personProfile.deleteMany({ where: { id: { in: personIds } } });
  await db.mediaFile.deleteMany({ where: { id: { in: mediaIds } } });
  await fixtures.cleanup();
});

// ─── helpers: taxonomy ──────────────────────────────────────────────────────────

type Names = Record<string, [name: string, slug: string]>;
const categoryBody = (names: Names, order = 1) => ({
  order,
  translations: Object.fromEntries(
    Object.entries(names).map(([locale, [name, slug]]) => [
      locale,
      { name, slug },
    ]),
  ),
});
const seriesBody = (names: Names) => ({
  translations: Object.fromEntries(
    Object.entries(names).map(([locale, [name, slug]]) => [
      locale,
      { name, slug, description: null },
    ]),
  ),
});

async function createCategory(
  names: Names,
  user = admin,
): Promise<CategoryDto> {
  const res = await call("POST", "/content/categories", {
    cookie: user.cookie,
    body: categoryBody(names),
  });
  expect(res.status).toBe(201);
  const created = await jsonOf<CategoryDto>(res);
  categoryIds.push(created.id);
  return created;
}

async function createSeries(names: Names, user = admin): Promise<SeriesDto> {
  const res = await call("POST", "/content/series", {
    cookie: user.cookie,
    body: seriesBody(names),
  });
  expect(res.status).toBe(201);
  const created = await jsonOf<SeriesDto>(res);
  seriesIds.push(created.id);
  return created;
}

// ─── helpers: posts ─────────────────────────────────────────────────────────────

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const bodyDoc = (...blocks: unknown[]) => ({
  type: "doc",
  content: blocks.length > 0 ? blocks : [paragraph("Texto")],
});

interface SnapshotOptions {
  slugs?: Record<string, string>;
  authorProfileId?: string;
  categoryId?: string;
  seriesId?: string;
  publishAt?: string;
  cover?: unknown;
  body?: unknown;
}

function snapshotOf(options: SnapshotOptions = {}) {
  const slugs = options.slugs ?? { es: slugOf("post") };
  return {
    translations: Object.fromEntries(
      Object.entries(slugs).map(([locale, slug]) => [
        locale,
        {
          title: `Titulo ${slug}`,
          slug,
          excerpt: `Extracto ${slug}`,
          body: options.body ?? bodyDoc(),
          tags: [],
        },
      ]),
    ),
    authorProfileId: options.authorProfileId ?? authorId,
    categoryId: options.categoryId ?? categoryId,
    ...(options.seriesId ? { seriesId: options.seriesId, seriesOrder: 1 } : {}),
    featured: false,
    relatedPostIds: [],
    cover: options.cover ?? { kind: "design", glyph: "anchor", tint: "paper" },
    writtenAt: "2026-01-15",
    ...(options.publishAt ? { publishAt: options.publishAt } : {}),
  };
}

async function createPost(user: TestUser = admin): Promise<string> {
  const res = await call("POST", "/content/posts", { cookie: user.cookie });
  expect(res.status).toBe(201);
  const { id } = await jsonOf<CreatePostResponse>(res);
  postIds.push(id);
  return id;
}

const editorial = (
  user: TestUser,
  id: string,
  action: string,
  body?: unknown,
) =>
  call(
    action === "draft" ? "PUT" : "POST",
    `/editorial/blog-post/${id}/${action}`,
    {
      cookie: user.cookie,
      body,
    },
  );

const saveDraft = (user: TestUser, id: string, options?: SnapshotOptions) =>
  editorial(user, id, "draft", { snapshot: snapshotOf(options) });

async function expectOk(res: Response): Promise<EditorialStatusDto> {
  expect(res.status).toBe(200);
  return jsonOf<EditorialStatusDto>(res);
}

/** Saves a draft and publishes it as the admin. */
async function publish(id: string, options?: SnapshotOptions): Promise<void> {
  await expectOk(await saveDraft(admin, id, options));
  await expectOk(await editorial(admin, id, "publish"));
}

const firstLiveAtOf = async (id: string): Promise<Date | null> =>
  (await db.post.findUniqueOrThrow({ where: { id } })).firstLiveAt;

// ─── POST and GET /content/posts ────────────────────────────────────────────────

describe("POST /content/posts and GET /content/posts", () => {
  test("creating a post returns its id and leaves an audit row", async () => {
    const res = await call("POST", "/content/posts", {
      cookie: creator.cookie,
    });
    expect(res.status).toBe(201);
    const { id } = await jsonOf<CreatePostResponse>(res);
    postIds.push(id);
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row?.action).toBe("post.created");
    expect(row?.entityType).toBe("post");
    expect(row?.entityId).toBe(id);
    expect(await db.post.count({ where: { id, organizationId } })).toBe(1);
  });

  test("the list carries states, default-language title, category, author, views and newest first", async () => {
    const empty = await createPost();
    const drafted = await createPost();
    await expectOk(await saveDraft(admin, drafted));
    const live = await createPost();
    await publish(live, { slugs: { es: slugOf("lista") } });
    await expectOk(
      await saveDraft(admin, live, { slugs: { es: slugOf("lista") } }),
    );
    const today = new Date(
      `${new Date().toISOString().slice(0, 10)}T00:00:00Z`,
    );
    const old = new Date(today.getTime() - 40 * 86_400_000);
    await db.postViewDaily.createMany({
      data: [
        { postId: live, day: today, count: 3 },
        { postId: live, day: old, count: 2 },
      ],
    });

    const res = await call("GET", "/content/posts", { cookie: viewer.cookie });
    expect(res.status).toBe(200);
    const { items } = await jsonOf<PostListDto>(res);
    const byId = new Map(items.map((item) => [item.id, item]));

    expect(byId.get(empty)).toEqual({
      id: empty,
      title: null,
      category: null,
      author: null,
      live: null,
      working: null,
      views30d: 0,
      viewsTotal: 0,
    });
    const draftItem = byId.get(drafted);
    expect(draftItem?.title).toStartWith("Titulo ");
    expect(draftItem?.working?.state).toBe("draft");
    expect(draftItem?.category?.name).toBe("Cat base");
    expect(draftItem?.author?.name).toContain("Blog test");
    const liveItem = byId.get(live);
    expect(liveItem?.live?.state).toBe("published");
    expect(liveItem?.working?.state).toBe("draft");
    expect(liveItem?.views30d).toBe(3);
    expect(liveItem?.viewsTotal).toBe(5);

    const order = items.map((item) => item.id);
    expect(order.indexOf(live)).toBeLessThan(order.indexOf(drafted));
    expect(order.indexOf(drafted)).toBeLessThan(order.indexOf(empty));
  });

  test("a post of another organization is not listed", async () => {
    const other = await fixtures.createOrganization("blog-other");
    const foreign = await db.post.create({
      data: { organizationId: other.id },
    });
    const res = await call("GET", "/content/posts", { cookie: admin.cookie });
    const { items } = await jsonOf<PostListDto>(res);
    expect(items.some((item) => item.id === foreign.id)).toBe(false);
  });
});

// ─── editorial routes on posts ──────────────────────────────────────────────────

describe("editorial routes on posts", () => {
  test("an entity that does not exist is a 404 on every route", async () => {
    const unknown = crypto.randomUUID();
    const attempts: [string, string, unknown?][] = [
      ["GET", `/editorial/blog-post/${unknown}`],
      ["GET", `/editorial/blog-post/${unknown}/history`],
      [
        "PUT",
        `/editorial/blog-post/${unknown}/draft`,
        { snapshot: snapshotOf() },
      ],
      ["POST", `/editorial/blog-post/${unknown}/submit`],
      ["POST", `/editorial/blog-post/${unknown}/publish`],
      ["POST", `/editorial/blog-post/${unknown}/pause`],
      ["POST", `/editorial/blog-post/${unknown}/approve`],
      [
        "POST",
        `/editorial/blog-post/${unknown}/request-changes`,
        { comment: "x" },
      ],
    ];
    for (const [method, path, body] of attempts) {
      const res = await call(method, path, { cookie: admin.cookie, body });
      expect(res.status, `${method} ${path}`).toBe(404);
    }
    expect(
      await db.contentRevision.count({ where: { entityId: unknown } }),
    ).toBe(0);
  });

  test("an invalid snapshot is a 400 and stores nothing", async () => {
    const id = await createPost();
    const link = (href: string) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "x",
          marks: [{ type: "link", attrs: { href } }],
        },
      ],
    });
    const cases: [string, unknown][] = [
      ["no default language", snapshotOf({ slugs: { en: slugOf("solo-en") } })],
      [
        "language not enabled",
        snapshotOf({ slugs: { es: slugOf("a"), xx: slugOf("b") } }),
      ],
      [
        "bad youtube id",
        snapshotOf({
          body: bodyDoc({
            type: "video",
            attrs: { youtubeId: "no", title: "v" },
          }),
        }),
      ],
      [
        "javascript: link",
        snapshotOf({ body: bodyDoc(link("javascript:alert(1)")) }),
      ],
      [
        "javascript: link card",
        snapshotOf({
          body: bodyDoc({
            type: "linkCards",
            attrs: { items: [{ title: "t", href: "javascript:alert(1)" }] },
          }),
        }),
      ],
      ["unknown node", snapshotOf({ body: bodyDoc({ type: "script" }) })],
      ["bad slug", snapshotOf({ slugs: { es: "Con Espacio" } })],
      ["not a uuid category", { ...snapshotOf(), categoryId: "nope" }],
    ];
    for (const [label, snapshot] of cases) {
      const res = await editorial(admin, id, "draft", { snapshot });
      expect(res.status, label).toBe(400);
    }
    const status = await expectOk(
      await call("GET", `/editorial/blog-post/${id}`, { cookie: admin.cookie }),
    );
    expect(status.working).toBeNull();
  });
});

// ─── references checked when going live ─────────────────────────────────────────

describe("what a post must reference to go live", () => {
  async function refusedPublish(
    options: SnapshotOptions,
  ): Promise<{ status: number; code: string }> {
    const id = await createPost();
    await expectOk(await saveDraft(admin, id, options));
    const res = await editorial(admin, id, "publish");
    const status = await expectOk(
      await call("GET", `/editorial/blog-post/${id}`, { cookie: admin.cookie }),
    );
    expect(status.live).toBeNull();
    return { status: res.status, code: await codeOf(res) };
  }

  test("a cover or a figure from another organization, not ready or not an image is a 400 invalid_media", async () => {
    const other = await fixtures.createOrganization("blog-media");
    const figure = (mediaId: string) => ({
      type: "figure",
      attrs: { mediaId, alt: "", aspect: "landscape" },
    });
    const bad = [
      await makeMedia(other.id),
      await makeMedia(organizationId, { status: "pending" }),
      await makeMedia(organizationId, { purpose: "voucherDocument" }),
      crypto.randomUUID(),
    ];
    for (const mediaId of bad) {
      expect(
        await refusedPublish({ cover: { kind: "photo", mediaId, alt: "" } }),
      ).toEqual({ status: 400, code: "invalid_media" });
      expect(
        await refusedPublish({
          slugs: { es: slugOf(`fig-${mediaId.slice(0, 6)}`) },
          body: bodyDoc(figure(mediaId)),
        }),
      ).toEqual({ status: 400, code: "invalid_media" });
    }
  });

  test("a ready content image of the organization is fine as cover and figure", async () => {
    const mediaId = await makeMedia(organizationId);
    const id = await createPost();
    await publish(id, {
      slugs: { es: slugOf("con-foto") },
      cover: { kind: "photo", mediaId, alt: "Foto" },
      body: bodyDoc({
        type: "figure",
        attrs: { mediaId, alt: "", aspect: "wide" },
      }),
    });
  });

  test("an author without the blog author role, or from another organization, is a 400 invalid_author", async () => {
    const teamOnly = await makeAuthor(organizationId, "TEAM");
    const other = await fixtures.createOrganization("blog-author");
    const foreign = await makeAuthor(other.id, "BLOG_AUTHOR");
    for (const authorProfileId of [teamOnly, foreign, crypto.randomUUID()]) {
      expect(await refusedPublish({ authorProfileId })).toEqual({
        status: 400,
        code: "invalid_author",
      });
    }
  });

  test("a missing or deleted category or series is a 400", async () => {
    const goneCategory = await createCategory({
      es: ["Borrada", slugOf("cat-gone")],
    });
    const goneSeries = await createSeries({
      es: ["Borrada", slugOf("ser-gone")],
    });
    for (const [path, id] of [
      ["categories", goneCategory.id],
      ["series", goneSeries.id],
    ] as const) {
      const res = await call("DELETE", `/content/${path}/${id}`, {
        cookie: admin.cookie,
      });
      expect(res.status).toBe(204);
    }
    expect(await refusedPublish({ categoryId: goneCategory.id })).toEqual({
      status: 400,
      code: "invalid_category",
    });
    expect(await refusedPublish({ categoryId: crypto.randomUUID() })).toEqual({
      status: 400,
      code: "invalid_category",
    });
    expect(await refusedPublish({ seriesId: goneSeries.id })).toEqual({
      status: 400,
      code: "invalid_series",
    });
  });
});

// ─── slugs ──────────────────────────────────────────────────────────────────────

describe("slugs of live posts", () => {
  test("the second post to publish with the same slug is a 409 slug_taken", async () => {
    const slug = slugOf("repetido");
    await publish(await createPost(), { slugs: { es: slug } });
    const second = await createPost();
    await expectOk(
      await saveDraft(admin, second, {
        slugs: { es: slugOf("otro"), en: slug },
      }),
    );
    const res = await editorial(admin, second, "publish");
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("slug_taken");
  });

  test("a paused post gives its slug back", async () => {
    const slug = slugOf("pausado");
    const first = await createPost();
    await publish(first, { slugs: { es: slug } });
    await expectOk(await editorial(admin, first, "pause"));
    await publish(await createPost(), { slugs: { es: slug } });
  });

  test("the slug of a published language cannot change; a new language picks its own", async () => {
    const slug = slugOf("fijo");
    const id = await createPost();
    await publish(id, { slugs: { es: slug } });

    await expectOk(
      await saveDraft(admin, id, { slugs: { es: slugOf("fijo-nuevo") } }),
    );
    const locked = await editorial(admin, id, "publish");
    expect(locked.status).toBe(409);
    expect(await codeOf(locked)).toBe("slug_locked");

    await expectOk(
      await saveDraft(admin, id, {
        slugs: { es: slug, en: slugOf("fixed-new") },
      }),
    );
    await expectOk(await editorial(admin, id, "publish"));
  });
});

// ─── the date of the URL ────────────────────────────────────────────────────────

describe("Post.firstLiveAt (the date of the URL)", () => {
  const DAY_MS = 86_400_000;
  const inDays = (days: number): string =>
    new Date(Date.now() + days * DAY_MS).toISOString();

  test("is fixed on the first publish and does not move when publishAt is edited afterwards", async () => {
    const id = await createPost();
    expect(await firstLiveAtOf(id)).toBeNull();
    await publish(id, { slugs: { es: slugOf("fecha-fija") } });
    const first = await firstLiveAtOf(id);
    expect(first).not.toBeNull();
    expect(Math.abs((first as Date).getTime() - Date.now())).toBeLessThan(
      60_000,
    );

    for (const publishAt of [inDays(10), inDays(-3)]) {
      await expectOk(
        await saveDraft(admin, id, {
          slugs: { es: slugOf("fecha-fija") },
          publishAt,
        }),
      );
      await expectOk(await editorial(admin, id, "publish"));
      expect(await firstLiveAtOf(id)).toEqual(first);
    }
  });

  test("a scheduled post takes publishAt as its date, and rescheduling it (never visible) moves it", async () => {
    const id = await createPost();
    const slug = slugOf("programado");
    const first = inDays(7);
    await publish(id, { slugs: { es: slug }, publishAt: first });
    expect(await firstLiveAtOf(id)).toEqual(new Date(first));

    const second = inDays(14);
    await expectOk(
      await saveDraft(admin, id, { slugs: { es: slug }, publishAt: second }),
    );
    await expectOk(await editorial(admin, id, "publish"));
    expect(await firstLiveAtOf(id)).toEqual(new Date(second));

    // Published now, with no schedule: the date was still in the future, so it becomes today.
    await expectOk(await saveDraft(admin, id, { slugs: { es: slug } }));
    await expectOk(await editorial(admin, id, "publish"));
    const now = await firstLiveAtOf(id);
    expect(Math.abs((now as Date).getTime() - Date.now())).toBeLessThan(60_000);
  });

  test("a refused publish leaves the date untouched", async () => {
    const id = await createPost();
    await expectOk(
      await saveDraft(admin, id, { authorProfileId: crypto.randomUUID() }),
    );
    expect((await editorial(admin, id, "publish")).status).toBe(400);
    expect(await firstLiveAtOf(id)).toBeNull();
  });
});

// ─── mandatory review ───────────────────────────────────────────────────────────

describe("mandatory review", () => {
  test("an author under mandatory review cannot publish even with the publish permission", async () => {
    await db.editorialSettings.create({
      data: {
        organizationId,
        contentType: "BLOG_POST",
        mandatoryReviewUserIds: [publisher.id],
      },
    });
    const id = await createPost();
    await expectOk(
      await saveDraft(publisher, id, { slugs: { es: slugOf("revisado") } }),
    );

    const direct = await editorial(publisher, id, "publish");
    expect(direct.status).toBe(403);
    expect(await codeOf(direct)).toBe("review_required");

    await expectOk(await editorial(publisher, id, "submit"));
    const approved = await expectOk(await editorial(admin, id, "approve"));
    expect(approved.live?.state).toBe("published");
    expect(await firstLiveAtOf(id)).not.toBeNull();
  });
});

// ─── categories ─────────────────────────────────────────────────────────────────

describe("categories", () => {
  test("creates, lists by order without deleted ones, and audits with after", async () => {
    const res = await call("POST", "/content/categories", {
      cookie: creator.cookie,
      body: categoryBody({ es: ["Fe", slugOf("fe")] }, 5),
    });
    expect(res.status).toBe(201);
    const created = await jsonOf<CategoryDto>(res);
    categoryIds.push(created.id);
    expect(created.version).toBe(1);
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row?.action).toBe("category.created");
    expect(row?.after).toMatchObject({ id: created.id, order: 5 });

    const list = await jsonOf<{ items: CategoryDto[] }>(
      await call("GET", "/content/categories", { cookie: viewer.cookie }),
    );
    expect(list.items.map((item) => item.id)).toContain(created.id);
    const orders = list.items.map((item) => item.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  test("languages: the default is required and only enabled ones are accepted", async () => {
    for (const names of [
      { en: ["x", slugOf("x-en")] },
      { es: ["x", slugOf("x-es")], xx: ["x", slugOf("x-xx")] },
    ] as Names[]) {
      const res = await call("POST", "/content/categories", {
        cookie: admin.cookie,
        body: categoryBody(names),
      });
      expect(res.status).toBe(400);
    }
  });

  test("a slug of the same language taken by a live category is a 409, a deleted one does not block", async () => {
    const slug = slugOf("unica");
    const first = await createCategory({ es: ["Unica", slug] });
    const clash = await call("POST", "/content/categories", {
      cookie: admin.cookie,
      body: categoryBody({ es: ["Otra", slug] }),
    });
    expect(clash.status).toBe(409);
    expect(await codeOf(clash)).toBe("slug_taken");

    expect(
      (
        await call("DELETE", `/content/categories/${first.id}`, {
          cookie: admin.cookie,
        })
      ).status,
    ).toBe(204);
    await createCategory({ es: ["Otra", slug] });
  });

  test("patch replaces the translations, bumps the version and audits before and after", async () => {
    const created = await createCategory({ es: ["Antes", slugOf("antes")] });
    const res = await call("PATCH", `/content/categories/${created.id}`, {
      cookie: admin.cookie,
      body: {
        ...categoryBody({ es: ["Despues", slugOf("despues")] }, 9),
        version: created.version,
      },
    });
    expect(res.status).toBe(200);
    const updated = await jsonOf<CategoryDto>(res);
    expect(updated.version).toBe(created.version + 1);
    expect(updated.translations.es?.name).toBe("Despues");
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row?.action).toBe("category.updated");
    expect(row?.before).toMatchObject({ order: created.order });
    expect(row?.after).toMatchObject({
      order: 9,
      version: created.version + 1,
    });
  });

  test("a stale version is a 409 stale_version and changes nothing", async () => {
    const created = await createCategory({ es: ["Lock", slugOf("lock")] });
    const body = {
      ...categoryBody({ es: ["Lock 2", slugOf("lock-2")] }),
      version: created.version,
    };
    expect(
      (
        await call("PATCH", `/content/categories/${created.id}`, {
          cookie: admin.cookie,
          body,
        })
      ).status,
    ).toBe(200);
    const stale = await call("PATCH", `/content/categories/${created.id}`, {
      cookie: admin.cookie,
      body: { ...body, ...categoryBody({ es: ["Lock 3", slugOf("lock-3")] }) },
    });
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");
    const row = await db.category.findUniqueOrThrow({
      where: { id: created.id },
      include: { translations: true },
    });
    expect(row.translations[0]?.name).toBe("Lock 2");
  });

  test("an unknown or deleted category is a 404", async () => {
    const created = await createCategory({ es: ["Gone", slugOf("gone")] });
    await call("DELETE", `/content/categories/${created.id}`, {
      cookie: admin.cookie,
    });
    for (const id of [created.id, crypto.randomUUID()]) {
      const patch = await call("PATCH", `/content/categories/${id}`, {
        cookie: admin.cookie,
        body: { ...categoryBody({ es: ["x", slugOf("x")] }), version: 1 },
      });
      expect(patch.status).toBe(404);
      const del = await call("DELETE", `/content/categories/${id}`, {
        cookie: admin.cookie,
      });
      expect(del.status).toBe(404);
    }
  });

  test("deleting is logical, audited, and refused while a live post uses it (category_in_use)", async () => {
    const used = await createCategory({ es: ["Usada", slugOf("usada")] });
    const postId = await createPost();
    await publish(postId, {
      slugs: { es: slugOf("usa-cat") },
      categoryId: used.id,
    });

    const refused = await call("DELETE", `/content/categories/${used.id}`, {
      cookie: admin.cookie,
    });
    expect(refused.status).toBe(409);
    expect(await codeOf(refused)).toBe("category_in_use");

    // Paused posts do not count: only live ones keep a category.
    await expectOk(await editorial(admin, postId, "pause"));
    const deleted = await call("DELETE", `/content/categories/${used.id}`, {
      cookie: admin.cookie,
    });
    expect(deleted.status).toBe(204);
    const row = await db.category.findUniqueOrThrow({ where: { id: used.id } });
    expect(row.deletedAt).not.toBeNull();
    const [audit] = await auditRowsOf({ requestId: requestIdOf(deleted) });
    expect(audit?.action).toBe("category.deleted");
    expect(audit?.before).toMatchObject({ id: used.id });
  });

  test("viewers cannot write", async () => {
    const res = await call("POST", "/content/categories", {
      cookie: viewer.cookie,
      body: categoryBody({ es: ["x", slugOf("viewer")] }),
    });
    expect(res.status).toBe(403);
  });
});

// ─── series ─────────────────────────────────────────────────────────────────────

describe("series", () => {
  test("creates with a description, lists, and audits", async () => {
    const res = await call("POST", "/content/series", {
      cookie: creator.cookie,
      body: {
        translations: {
          es: {
            name: "Hebreos",
            slug: slugOf("hebreos"),
            description: "Un estudio",
          },
        },
      },
    });
    expect(res.status).toBe(201);
    const created = await jsonOf<SeriesDto>(res);
    seriesIds.push(created.id);
    expect(created.translations.es?.description).toBe("Un estudio");
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row?.action).toBe("series.created");
    const list = await jsonOf<{ items: SeriesDto[] }>(
      await call("GET", "/content/series", { cookie: viewer.cookie }),
    );
    expect(list.items.map((item) => item.id)).toContain(created.id);
  });

  test("slug taken, stale version, languages and audit before/after", async () => {
    const slug = slugOf("s-unica");
    const created = await createSeries({ es: ["Uno", slug] });
    const clash = await call("POST", "/content/series", {
      cookie: admin.cookie,
      body: seriesBody({ es: ["Dos", slug] }),
    });
    expect(clash.status).toBe(409);
    expect(await codeOf(clash)).toBe("slug_taken");
    const noDefault = await call("POST", "/content/series", {
      cookie: admin.cookie,
      body: seriesBody({ en: ["Two", slugOf("s-en")] }),
    });
    expect(noDefault.status).toBe(400);

    const patch = await call("PATCH", `/content/series/${created.id}`, {
      cookie: admin.cookie,
      body: {
        ...seriesBody({ es: ["Uno bis", slug] }),
        version: created.version,
      },
    });
    expect(patch.status).toBe(200);
    const [row] = await auditRowsOf({ requestId: requestIdOf(patch) });
    expect(row?.action).toBe("series.updated");
    expect(row?.before).toMatchObject({ version: created.version });
    expect(row?.after).toMatchObject({ version: created.version + 1 });

    const stale = await call("PATCH", `/content/series/${created.id}`, {
      cookie: admin.cookie,
      body: {
        ...seriesBody({ es: ["Uno tris", slug] }),
        version: created.version,
      },
    });
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");
  });

  test("deleting is refused while a live post belongs to it (series_in_use), then logical", async () => {
    const used = await createSeries({ es: ["En uso", slugOf("s-uso")] });
    const postId = await createPost();
    await publish(postId, {
      slugs: { es: slugOf("en-serie") },
      seriesId: used.id,
    });

    const refused = await call("DELETE", `/content/series/${used.id}`, {
      cookie: admin.cookie,
    });
    expect(refused.status).toBe(409);
    expect(await codeOf(refused)).toBe("series_in_use");

    await expectOk(await editorial(admin, postId, "pause"));
    const deleted = await call("DELETE", `/content/series/${used.id}`, {
      cookie: admin.cookie,
    });
    expect(deleted.status).toBe(204);
    expect(
      (await db.series.findUniqueOrThrow({ where: { id: used.id } })).deletedAt,
    ).not.toBeNull();
    const [audit] = await auditRowsOf({ requestId: requestIdOf(deleted) });
    expect(audit?.action).toBe("series.deleted");
  });
});
