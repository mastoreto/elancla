import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  type CreateSimplePageResponse,
  type EditorialStatusDto,
  grant,
  PERMISSIONS,
  type PublicPageDto,
  type PublicPageListDto,
  publicPageDto,
  publicPageListDto,
  type SimplePageListDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";
import { PUBLIC_CACHE_CONTROL } from "../public";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

interface TestUser {
  id: string;
  cookie: string;
}

let organizationId = "";
let churchSlug = "";
let siteKey = "";
let admin: TestUser;
let editor: TestUser;
let viewer: TestUser;
const createdPageIds: string[] = [];

const suffix = crypto.randomUUID().slice(0, 8);
const slugOf = (name: string): string => `${name}-${suffix}`;

const doc = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

type Translations = Record<string, { title: string; slug: string }>;
const snapshotOf = (translations: Translations) => ({
  translations: Object.fromEntries(
    Object.entries(translations).map(([locale, { title, slug }]) => [
      locale,
      { title, slug, body: doc(`Body ${title}`) },
    ]),
  ),
});

async function makeUser(
  label: string,
  access: Parameters<typeof fixtures.passwordUser>[2],
): Promise<TestUser> {
  const auth = getAuth();
  const email = await fixtures.passwordUser(auth, label, access);
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  return { id: user.id, cookie: await fixtures.signIn(auth, email) };
}

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  const organization = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { slug: true },
  });
  churchSlug = organization.slug;
  siteKey = (await fixtures.createSiteKey(organizationId)).key;
  admin = await makeUser("pages-admin", ["admin"]);
  editor = await makeUser("pages-editor", [
    grant(PERMISSIONS.pages.view),
    grant(PERMISSIONS.pages.create),
    grant(PERMISSIONS.pages.edit),
  ]);
  viewer = await makeUser("pages-viewer", [grant(PERMISSIONS.pages.view)]);
});

beforeEach(async () => {
  await db.editorialSettings.deleteMany({
    where: { organizationId, contentType: "SIMPLE_PAGE" },
  });
});

afterAll(async () => {
  await db.editorialSettings.deleteMany({
    where: { organizationId, contentType: "SIMPLE_PAGE" },
  });
  await db.simplePage.deleteMany({ where: { id: { in: createdPageIds } } });
  await fixtures.cleanup();
});

async function createPage(user: TestUser = admin): Promise<string> {
  const res = await call("POST", "/content/pages", { cookie: user.cookie });
  expect(res.status).toBe(201);
  const { id } = (await res.json()) as CreateSimplePageResponse;
  createdPageIds.push(id);
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
    `/editorial/simple-page/${id}/${action}`,
    {
      cookie: user.cookie,
      body,
    },
  );

const saveDraft = (user: TestUser, id: string, translations: Translations) =>
  editorial(user, id, "draft", { snapshot: snapshotOf(translations) });

async function expectOk(res: Response): Promise<EditorialStatusDto> {
  expect(res.status).toBe(200);
  return (await res.json()) as EditorialStatusDto;
}

/** A page with the Spanish text, published directly by the admin. */
async function publishedPage(
  slug: string,
  extra: Translations = {},
  title = `Titulo ${slug}`,
): Promise<string> {
  const id = await createPage();
  await expectOk(await saveDraft(admin, id, { es: { title, slug }, ...extra }));
  await expectOk(await editorial(admin, id, "publish"));
  return id;
}

const publicGet = (path: string, query = ""): Promise<Response> =>
  call("GET", `/public/v1/${churchSlug}/pages${path}${query}`, {
    headers: { Authorization: `Bearer ${siteKey}` },
  });

describe("POST /content/pages and GET /content/pages", () => {
  test("creating a page returns its id and leaves an audit row", async () => {
    const res = await call("POST", "/content/pages", { cookie: editor.cookie });
    expect(res.status).toBe(201);
    const { id } = (await res.json()) as CreateSimplePageResponse;
    createdPageIds.push(id);
    const [row] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(row?.action).toBe("simplePage.created");
    expect(row?.entityType).toBe("simplePage");
    expect(row?.entityId).toBe(id);
    expect(await db.simplePage.count({ where: { id, organizationId } })).toBe(
      1,
    );
  });

  test("the list shows the states, the default-language title and newest first", async () => {
    const empty = await createPage();
    const drafted = await createPage();
    await expectOk(
      await saveDraft(admin, drafted, {
        es: { title: "Solo borrador", slug: slugOf("solo-borrador") },
      }),
    );
    const live = await publishedPage(slugOf("en-vivo"), {}, "Publicada");
    await expectOk(
      await saveDraft(admin, live, {
        es: { title: "Publicada editada", slug: slugOf("en-vivo") },
      }),
    );

    const res = await call("GET", "/content/pages", { cookie: viewer.cookie });
    expect(res.status).toBe(200);
    const { items } = (await res.json()) as SimplePageListDto;
    const byId = new Map(items.map((item) => [item.id, item]));

    expect(byId.get(empty)).toEqual({
      id: empty,
      title: null,
      live: null,
      working: null,
    });
    expect(byId.get(drafted)?.title).toBe("Solo borrador");
    expect(byId.get(drafted)?.working?.state).toBe("draft");
    const liveItem = byId.get(live);
    expect(liveItem?.title).toBe("Publicada editada");
    expect(liveItem?.live?.state).toBe("published");
    expect(liveItem?.working?.state).toBe("draft");

    const order = items.map((item) => item.id);
    expect(order.indexOf(live)).toBeLessThan(order.indexOf(drafted));
    expect(order.indexOf(drafted)).toBeLessThan(order.indexOf(empty));
  });
});

describe("editorial routes on simple pages", () => {
  test("an entity that does not exist is a 404 on every route", async () => {
    const unknown = crypto.randomUUID();
    const attempts: [string, string, unknown?][] = [
      ["GET", `/editorial/simple-page/${unknown}`],
      ["GET", `/editorial/simple-page/${unknown}/history`],
      [
        "PUT",
        `/editorial/simple-page/${unknown}/draft`,
        { snapshot: snapshotOf({ es: { title: "x", slug: "x" } }) },
      ],
      ["POST", `/editorial/simple-page/${unknown}/submit`],
      ["POST", `/editorial/simple-page/${unknown}/publish`],
      ["POST", `/editorial/simple-page/${unknown}/pause`],
      ["POST", `/editorial/simple-page/${unknown}/approve`],
      [
        "POST",
        `/editorial/simple-page/${unknown}/request-changes`,
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

  test("a page of another organization is a 404 too", async () => {
    const other = await fixtures.createOrganization("pages-other");
    const foreign = await db.simplePage.create({
      data: { organizationId: other.id },
    });
    createdPageIds.push(foreign.id);
    const res = await call("GET", `/editorial/simple-page/${foreign.id}`, {
      cookie: admin.cookie,
    });
    expect(res.status).toBe(404);
  });

  test("an invalid snapshot is a 400", async () => {
    const id = await createPage();
    const body = doc("x");
    const bad: [string, unknown][] = [
      ["reserved slug", { es: { title: "t", slug: "blog", body } }],
      ["bad slug", { es: { title: "t", slug: "Con Espacio", body } }],
      [
        "javascript: link",
        {
          es: {
            title: "t",
            slug: slugOf("xss"),
            body: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "x",
                      marks: [
                        {
                          type: "link",
                          attrs: { href: "javascript:alert(1)" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
      [
        "no default language",
        { en: { title: "t", slug: slugOf("en-only"), body } },
      ],
      [
        "language not enabled",
        {
          es: { title: "t", slug: slugOf("ok"), body },
          xx: { title: "t", slug: slugOf("xx"), body },
        },
      ],
    ];
    for (const [label, translations] of bad) {
      const res = await editorial(admin, id, "draft", {
        snapshot: { translations },
      });
      expect(res.status, label).toBe(400);
    }
    const status = await expectOk(
      await call("GET", `/editorial/simple-page/${id}`, {
        cookie: admin.cookie,
      }),
    );
    expect(status.working).toBeNull();
  });
});

describe("unique slugs among live pages", () => {
  test("the second page to publish with the same slug is a 409 slug_taken", async () => {
    const slug = slugOf("repetida");
    await publishedPage(slug);
    const second = await createPage();
    await expectOk(
      await saveDraft(admin, second, { es: { title: "Otra", slug } }),
    );
    const res = await editorial(admin, second, "publish");
    expect(res.status).toBe(409);
    expect(((await res.json()) as { code: string }).code).toBe("slug_taken");
    const status = await expectOk(
      await call("GET", `/editorial/simple-page/${second}`, {
        cookie: admin.cookie,
      }),
    );
    expect(status.live).toBeNull();
    expect(status.working?.state).toBe("draft");
  });

  test("a slug in another language of another page clashes; the same page's own slugs do not", async () => {
    const slug = slugOf("cruzada");
    await publishedPage(slugOf("base"), { en: { title: "Base", slug } });
    const clash = await createPage();
    await expectOk(
      await saveDraft(admin, clash, { es: { title: "Choca", slug } }),
    );
    expect((await editorial(admin, clash, "publish")).status).toBe(409);

    const samePage = await createPage();
    const same = slugOf("mismo");
    await expectOk(
      await saveDraft(admin, samePage, {
        es: { title: "Mismo", slug: same },
        en: { title: "Same", slug: same },
      }),
    );
    await expectOk(await editorial(admin, samePage, "publish"));
  });

  test("republishing an edit of the same page keeps its slug", async () => {
    const slug = slugOf("editada");
    const id = await publishedPage(slug);
    await expectOk(
      await saveDraft(admin, id, { es: { title: "Nueva", slug } }),
    );
    await expectOk(await editorial(admin, id, "publish"));
  });

  test("approve checks it too", async () => {
    const slug = slugOf("por-aprobar");
    await publishedPage(slug);
    const second = await createPage();
    await db.editorialSettings.create({
      data: {
        organizationId,
        contentType: "SIMPLE_PAGE",
        mandatoryReviewUserIds: [editor.id],
      },
    });
    await expectOk(
      await saveDraft(editor, second, { es: { title: "Otra", slug } }),
    );
    await expectOk(await editorial(editor, second, "submit"));
    const res = await editorial(admin, second, "approve");
    expect(res.status).toBe(409);
    expect(((await res.json()) as { code: string }).code).toBe("slug_taken");
    const status = await expectOk(
      await call("GET", `/editorial/simple-page/${second}`, {
        cookie: admin.cookie,
      }),
    );
    expect(status.working?.state).toBe("in_review");
  });

  test("a paused page does not hold its slug, and resuming it after another took it is a 409", async () => {
    const slug = slugOf("pausada");
    const paused = await publishedPage(slug);
    await expectOk(await editorial(admin, paused, "pause"));
    const taker = await publishedPage(slug);
    const resume = await editorial(admin, paused, "publish");
    expect(resume.status).toBe(409);
    expect(((await resume.json()) as { code: string }).code).toBe("slug_taken");
    expect(taker).not.toBe(paused);
  });
});

describe("GET /public/v1/:churchSlug/pages", () => {
  test("lists only published pages, by title, with the cache policy and no ids", async () => {
    const zeta = await publishedPage(slugOf("zeta"), {}, `Zeta ${suffix}`);
    await publishedPage(slugOf("alfa"), {}, `Alfa ${suffix}`);
    const paused = await publishedPage(
      slugOf("oculta"),
      {},
      `Oculta ${suffix}`,
    );
    await expectOk(await editorial(admin, paused, "pause"));
    const draftOnly = await createPage();
    await expectOk(
      await saveDraft(admin, draftOnly, {
        es: { title: `Borrador ${suffix}`, slug: slugOf("borrador") },
      }),
    );

    const res = await publicGet("", "?locale=es");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const raw = await res.json();
    const list = publicPageListDto.parse(raw) as PublicPageListDto;
    const mine = list.items.filter((item) => item.title.endsWith(` ${suffix}`));
    expect(mine.map((item) => item.title)).toEqual([
      `Alfa ${suffix}`,
      `Zeta ${suffix}`,
    ]);
    expect(JSON.stringify(raw)).not.toContain(zeta);
    expect(JSON.stringify(raw)).not.toContain('"id"');
  });

  test("falls back to the default language and skips pages with neither", async () => {
    await publishedPage(slugOf("dos-idiomas"), {
      en: { title: `English ${suffix}`, slug: slugOf("two-languages") },
    });
    const res = await publicGet("", "?locale=en");
    const { items } = (await res.json()) as PublicPageListDto;
    expect(items.some((item) => item.slug === slugOf("two-languages"))).toBe(
      true,
    );
    const pt = (await (
      await publicGet("", "?locale=pt")
    ).json()) as PublicPageListDto;
    expect(pt.items.some((item) => item.slug === slugOf("dos-idiomas"))).toBe(
      true,
    );
    expect(pt.items.some((item) => item.slug === slugOf("two-languages"))).toBe(
      false,
    );
  });

  test("a bad key is a 401 and a bad locale a 400", async () => {
    const noKey = await call("GET", `/public/v1/${churchSlug}/pages`);
    expect(noKey.status).toBe(401);
    expect((await publicGet("", "?locale=xx_yy")).status).toBe(400);
  });
});

describe("GET /public/v1/:churchSlug/pages/:slug", () => {
  test("serves the page with its alternates and no internals", async () => {
    const es = slugOf("privacidad-test");
    const en = slugOf("privacy-test");
    await publishedPage(es, { en: { title: "Privacy", slug: en } });

    const res = await publicGet(`/${es}`, "?locale=en");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const raw = await res.json();
    const page = publicPageDto.parse(raw) as PublicPageDto;
    expect(page.locale).toBe("en");
    expect(page.slug).toBe(en);
    expect(page.title).toBe("Privacy");
    expect(page.alternates).toEqual({ es, en });
    expect(page.seoTitle).toBeNull();
    for (const key of ['"id"', "organizationId", "entityId", "authorId"]) {
      expect(JSON.stringify(raw)).not.toContain(key);
    }
  });

  test("a language the page lacks serves the default one and says so", async () => {
    const slug = slugOf("solo-es");
    await publishedPage(slug);
    const page = (await (
      await publicGet(`/${slug}`, "?locale=pt")
    ).json()) as PublicPageDto;
    expect(page.locale).toBe("es");
    expect(page.alternates).toEqual({ es: slug });
  });

  test("an unknown slug and a paused page are the same 404 problem", async () => {
    const slug = slugOf("a-pausar");
    const id = await publishedPage(slug);
    expect((await publicGet(`/${slug}`)).status).toBe(200);
    await expectOk(await editorial(admin, id, "pause"));
    const paused = await publicGet(`/${slug}`);
    const unknown = await publicGet(`/${slugOf("no-existe")}`);
    expect(paused.status).toBe(404);
    expect(unknown.status).toBe(404);
    expect(paused.headers.get("content-type")).toContain("problem+json");
    await expectOk(await editorial(admin, id, "publish"));
    expect((await publicGet(`/${slug}`)).status).toBe(200);
  });

  test("editing a published page changes nothing public until it is approved", async () => {
    const slug = slugOf("en-revision");
    const id = await publishedPage(slug, {}, "Viejo");
    await db.editorialSettings.create({
      data: {
        organizationId,
        contentType: "SIMPLE_PAGE",
        mandatoryReviewUserIds: [editor.id],
      },
    });
    await expectOk(
      await saveDraft(editor, id, { es: { title: "Nuevo", slug } }),
    );
    await expectOk(await editorial(editor, id, "submit"));
    const before = (await (
      await publicGet(`/${slug}`)
    ).json()) as PublicPageDto;
    expect(before.title).toBe("Viejo");

    await expectOk(await editorial(admin, id, "approve"));
    const after = (await (await publicGet(`/${slug}`)).json()) as PublicPageDto;
    expect(after.title).toBe("Nuevo");
  });
});

describe("types without entityExists keep their behavior", () => {
  test("an entity id that is not a row is still fine for types without entityExists", async () => {
    const res = await call(
      "GET",
      `/editorial/ministry/${crypto.randomUUID()}`,
      {
        cookie: admin.cookie,
      },
    );
    expect(res.status).toBe(200);
  });
});
