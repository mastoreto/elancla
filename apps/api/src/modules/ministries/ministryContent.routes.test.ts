import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  AUDIT_ACTIONS,
  type EditorialStatusDto,
  grant,
  type MinistryCategoryDto,
  type MinistryLeadersDto,
  type MinistryListDto,
  type MinistryListItemDto,
  PERMISSIONS,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { validMinistrySnapshot } from "../../../test/support/ministrySnapshot";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";
const PROFILE = PERMISSIONS.ministryProfile;

let adminCookie = "";
let leaderCookie = "";
let financeCookie = "";
let ownMinistry = "";
let otherMinistry = "";
let foreignMediaId = "";
const mediaIds: string[] = [];

async function cookieOf(
  label: string,
  access: Parameters<typeof fixtures.passwordUser>[2],
  options: Parameters<typeof fixtures.passwordUser>[3] = {},
): Promise<string> {
  const auth = getAuth();
  return fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, label, access, options),
  );
}

beforeAll(async () => {
  adminCookie = await cookieOf("ministry-admin", ["admin"]);
  ownMinistry = await fixtures.createMinistry("content-own");
  otherMinistry = await fixtures.createMinistry("content-other");
  leaderCookie = await cookieOf(
    "ministry-leader",
    [grant(PROFILE.view, "ministry"), grant(PROFILE.edit, "ministry")],
    { ministryIds: [ownMinistry] },
  );
  financeCookie = await cookieOf("ministry-finance", [
    grant(PERMISSIONS.ministryFinance.view, "all"),
  ]);

  const foreign = await fixtures.createOrganization("ministry-foreign");
  const id = crypto.randomUUID();
  await db.mediaFile.create({
    data: {
      id,
      organizationId: foreign.id,
      purpose: "contentImage",
      status: "ready",
      key: `${foreign.id}/${id}`,
      contentType: "image/png",
      size: 10,
      originalName: "photo.png",
    },
  });
  foreignMediaId = id;
  mediaIds.push(id);
});

afterAll(async () => {
  await db.mediaFile.deleteMany({ where: { id: { in: mediaIds } } });
  await fixtures.cleanup();
});

const editorial = (id: string, suffix = "") =>
  `/editorial/ministry/${id}${suffix}`;

async function createMinistry(name: string): Promise<string> {
  const res = await call("POST", "/content/ministries", {
    cookie: adminCookie,
    body: { name },
  });
  expect(res.status).toBe(201);
  const { id } = (await res.json()) as { id: string };
  fixtures.trackMinistry(id);
  return id;
}

/** Creates a category as the admin; it is removed in `cleanup()`. */
async function createCategory(
  body: unknown,
  cookie = adminCookie,
): Promise<Response> {
  const res = await call("POST", "/content/ministry-categories", {
    cookie,
    body,
  });
  if (res.status === 201) {
    fixtures.trackMinistryCategory(
      ((await res.clone().json()) as { id: string }).id,
    );
  }
  return res;
}

/** Saves the draft as the admin and publishes it: what an editor with publish rights does. */
async function publish(
  id: string,
  snapshot = validMinistrySnapshot(id),
): Promise<Response> {
  const saved = await call("PUT", editorial(id, "/draft"), {
    cookie: adminCookie,
    body: { snapshot },
  });
  expect(saved.status).toBe(200);
  return call("POST", editorial(id, "/publish"), { cookie: adminCookie });
}

const codeOf = async (res: Response): Promise<unknown> =>
  ((await res.json()) as { code?: string }).code;

async function listAs(cookie: string): Promise<MinistryListItemDto[]> {
  const res = await call("GET", "/content/ministries", { cookie });
  expect(res.status).toBe(200);
  return ((await res.json()) as MinistryListDto).items;
}

const settingsBody = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  categoryId: null,
  destination: "page",
  icon: "alabanza",
  color: "obra-red",
  ...overrides,
});

describe("the profile does not touch treasury", () => {
  test("bodies are strict: a financial field is a 400", async () => {
    const draft = await call("PUT", editorial(ownMinistry, "/draft"), {
      cookie: adminCookie,
      body: {
        snapshot: { ...validMinistrySnapshot(ownMinistry), budget: 1000 },
      },
    });
    expect(draft.status).toBe(400);
    const settings = await call(
      "PATCH",
      `/content/ministries/${ownMinistry}/settings`,
      { cookie: adminCookie, body: settingsBody({ budget: 1000 }) },
    );
    expect(settings.status).toBe(400);
    const category = await call("POST", "/content/ministry-categories", {
      cookie: adminCookie,
      body: { order: 1, translations: { es: { name: "X" } }, budget: 1 },
    });
    expect(category.status).toBe(400);
  });

  test("a role with only ministryFinance is a 403 on every profile route", async () => {
    const routes: [string, string, unknown?][] = [
      ["GET", "/content/ministries"],
      ["POST", "/content/ministries", { name: "x" }],
      ["PATCH", `/content/ministries/${ownMinistry}/settings`, settingsBody()],
      ["PUT", `/content/ministries/${ownMinistry}/leaders`, []],
      ["PATCH", "/content/ministries/landing", []],
      ["GET", "/content/ministry-categories"],
      ["GET", editorial(ownMinistry)],
      ["PUT", editorial(ownMinistry, "/draft"), { snapshot: {} }],
      ["POST", editorial(ownMinistry, "/publish")],
    ];
    for (const [method, path, body] of routes) {
      const res = await call(method, path, { cookie: financeCookie, body });
      expect({ method, path, status: res.status }).toEqual({
        method,
        path,
        status: 403,
      });
    }
  });
});

describe("the leader of a ministry", () => {
  test("edits and submits their own ministry, but cannot publish it", async () => {
    const saved = await call("PUT", editorial(ownMinistry, "/draft"), {
      cookie: leaderCookie,
      body: { snapshot: validMinistrySnapshot(ownMinistry, "Propio") },
    });
    expect(saved.status).toBe(200);
    expect(
      ((await saved.json()) as EditorialStatusDto).availableActions,
    ).toEqual(["saveDraft", "submit"]);
    const submitted = await call("POST", editorial(ownMinistry, "/submit"), {
      cookie: leaderCookie,
    });
    expect(submitted.status).toBe(200);
    const published = await call("POST", editorial(ownMinistry, "/publish"), {
      cookie: leaderCookie,
    });
    expect(published.status).toBe(403);
  });

  test("is refused on another ministry", async () => {
    const draft = await call("PUT", editorial(otherMinistry, "/draft"), {
      cookie: leaderCookie,
      body: { snapshot: validMinistrySnapshot(otherMinistry) },
    });
    expect(draft.status).toBe(403);
    const submit = await call("POST", editorial(otherMinistry, "/submit"), {
      cookie: leaderCookie,
    });
    expect(submit.status).toBe(403);
  });

  test("sees only their own ministry in the list", async () => {
    const ids = (await listAs(leaderCookie)).map((item) => item.id);
    expect(ids).toEqual([ownMinistry]);
    const all = (await listAs(adminCookie)).map((item) => item.id);
    expect(all).toContain(otherMinistry);
  });

  test("cannot change settings, leaders, the mosaic, the categories or create ministries", async () => {
    const category = await createCategory({
      order: 1,
      translations: { es: { name: "Para el líder" } },
    });
    const { id: categoryId } = (await category.json()) as MinistryCategoryDto;
    const attempts: [string, string, unknown?][] = [
      ["PATCH", `/content/ministries/${ownMinistry}/settings`, settingsBody()],
      ["PUT", `/content/ministries/${ownMinistry}/leaders`, []],
      ["PATCH", "/content/ministries/landing", []],
      ["POST", "/content/ministries", { name: "Nuevo" }],
      [
        "POST",
        "/content/ministry-categories",
        { order: 1, translations: { es: { name: "X" } } },
      ],
      [
        "PATCH",
        `/content/ministry-categories/${categoryId}`,
        { version: 1, order: 1, translations: { es: { name: "X" } } },
      ],
      ["DELETE", `/content/ministry-categories/${categoryId}`],
    ];
    for (const [method, path, body] of attempts) {
      const res = await call(method, path, { cookie: leaderCookie, body });
      expect({ method, path, status: res.status }).toEqual({
        method,
        path,
        status: 403,
      });
    }
  });
});

describe("editorial rules of a ministry", () => {
  test("an invalid snapshot is a 400 and an id that is not a ministry a 404", async () => {
    const invalid = await call("PUT", editorial(ownMinistry, "/draft"), {
      cookie: adminCookie,
      body: { snapshot: { translations: { es: { name: "" } } } },
    });
    expect(invalid.status).toBe(400);
    const unknown = await call(
      "PUT",
      editorial(crypto.randomUUID(), "/draft"),
      {
        cookie: adminCookie,
        body: { snapshot: validMinistrySnapshot(UNKNOWN_ID) },
      },
    );
    expect(unknown.status).toBe(404);
  });

  test("a language that is not enabled is a 400", async () => {
    const id = await createMinistry("Sin idioma");
    const snapshot = validMinistrySnapshot(id);
    const res = await call("PUT", editorial(id, "/draft"), {
      cookie: adminCookie,
      body: {
        snapshot: {
          translations: {
            ...snapshot.translations,
            fr: snapshot.translations.es,
          },
        },
      },
    });
    expect(res.status).toBe(400);
  });

  test("two live ministries cannot share a slug (slug_taken)", async () => {
    const first = await createMinistry("Primero");
    const second = await createMinistry("Segundo");
    const slug = `shared-${crypto.randomUUID()}`;
    const base = validMinistrySnapshot(first);
    const withSlug = (id: string) => ({
      translations: {
        es: { ...validMinistrySnapshot(id).translations.es, slug },
      },
    });
    expect((await publish(first, { ...base, ...withSlug(first) })).status).toBe(
      200,
    );
    const clash = await publish(second, withSlug(second));
    expect(clash.status).toBe(409);
    expect(await codeOf(clash)).toBe("slug_taken");
  });

  test("the slug of a published language is locked, a new language picks its own (slug_locked)", async () => {
    const id = await createMinistry("Fijo");
    expect((await publish(id)).status).toBe(200);
    const original = validMinistrySnapshot(id);

    const renamed = await publish(id, {
      translations: {
        es: { ...original.translations.es, slug: `otro-${id}` },
      },
    } as typeof original);
    expect(renamed.status).toBe(409);
    expect(await codeOf(renamed)).toBe("slug_locked");

    const withEnglish = await call("PUT", editorial(id, "/draft"), {
      cookie: adminCookie,
      body: {
        snapshot: {
          translations: {
            es: original.translations.es,
            en: { ...original.translations.es, slug: `english-${id}` },
          },
        },
      },
    });
    expect(withEnglish.status).toBe(200);
    const live = await call("POST", editorial(id, "/publish"), {
      cookie: adminCookie,
    });
    expect(live.status).toBe(200);
  });

  test("a cover from another church is a 400 invalid_media", async () => {
    const id = await createMinistry("Con portada");
    const res = await publish(id, {
      ...validMinistrySnapshot(id),
      coverMediaId: foreignMediaId,
    });
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_media");
  });
});

describe("POST /content/ministries", () => {
  test("creates an empty ministry with a free internal slug and audits it", async () => {
    const name = `Enseñanza ${crypto.randomUUID().slice(0, 8)}`;
    const id = await createMinistry(name);
    const again = await createMinistry(name);
    const rows = await db.ministry.findMany({
      where: { id: { in: [id, again] } },
      orderBy: { id: "asc" },
    });
    expect(rows[0]?.slug).toMatch(/^ensenanza-[0-9a-f]{8}$/);
    expect(rows[1]?.slug).toBe(`${rows[0]?.slug}-2`);
    expect(rows[0]).toMatchObject({
      destination: "PAGE",
      showOnLanding: false,
      version: 1,
    });
    const [audit] = await auditRowsOf({
      entityId: id,
      action: AUDIT_ACTIONS.ministry.created,
    });
    expect(audit?.after).toMatchObject({ id, name });
  });

  test("an empty name is a 400", async () => {
    const res = await call("POST", "/content/ministries", {
      cookie: adminCookie,
      body: { name: " " },
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /content/ministries/:id/settings", () => {
  test("saves the settings with before and after and moves the version", async () => {
    const id = await createMinistry("Ajustes");
    const category = (await (
      await createCategory({
        order: 1,
        translations: { es: { name: "Cat ajustes" } },
      })
    ).json()) as MinistryCategoryDto;

    const res = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({ categoryId: category.id, color: "obra-ink" }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as MinistryListItemDto;
    expect(updated).toMatchObject({
      id,
      version: 2,
      categoryId: category.id,
      destination: "page",
      icon: "alabanza",
      color: "obra-ink",
      live: null,
      working: null,
    });

    const [audit] = await auditRowsOf({
      entityId: id,
      action: AUDIT_ACTIONS.ministry.settingsUpdated,
    });
    expect(audit?.before).toMatchObject({ version: 1, categoryId: null });
    expect(audit?.after).toMatchObject({
      version: 2,
      categoryId: category.id,
      color: "obra-ink",
    });
  });

  test("a stale version is a 409 stale_version", async () => {
    const id = await createMinistry("Versión");
    const first = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody(),
    });
    expect(first.status).toBe(200);
    const stale = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({ color: "obra-ink" }),
    });
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");
  });

  test("an external destination needs an https URL and a page destination drops it", async () => {
    const id = await createMinistry("Externo");
    const missing = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({ destination: "external" }),
    });
    expect(missing.status).toBe(400);
    const insecure = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({
        destination: "external",
        externalUrl: "http://example.org",
      }),
    });
    expect(insecure.status).toBe(400);

    const external = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({
        destination: "external",
        externalUrl: "https://example.org/",
      }),
    });
    expect(external.status).toBe(200);
    const back = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({
        version: 2,
        destination: "page",
        externalUrl: "https://example.org/",
      }),
    });
    expect(((await back.json()) as MinistryListItemDto).externalUrl).toBeNull();
  });

  test("an unknown ministry is a 404 and an unknown category a 400", async () => {
    const id = await createMinistry("Referencias");
    const unknown = await call(
      "PATCH",
      `/content/ministries/${crypto.randomUUID()}/settings`,
      { cookie: adminCookie, body: settingsBody() },
    );
    expect(unknown.status).toBe(404);
    const category = await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({ categoryId: crypto.randomUUID() }),
    });
    expect(category.status).toBe(400);
    expect(await codeOf(category)).toBe("invalid_category");
  });
});

describe("ministry categories", () => {
  const body = {
    order: 1,
    translations: { es: { name: "Crecer" }, en: { name: "Grow" } },
  };

  test("create, update with the version, and delete, each audited", async () => {
    const created = await createCategory(body);
    expect(created.status).toBe(201);
    const category = (await created.json()) as MinistryCategoryDto;
    expect(category).toMatchObject({
      order: 1,
      version: 1,
      translations: body.translations,
    });

    const patched = await call(
      "PATCH",
      `/content/ministry-categories/${category.id}`,
      {
        cookie: adminCookie,
        body: { ...body, version: 1, translations: { es: { name: "Servir" } } },
      },
    );
    expect(patched.status).toBe(200);
    const updated = (await patched.json()) as MinistryCategoryDto;
    expect(updated).toMatchObject({
      version: 2,
      translations: { es: { name: "Servir" } },
    });

    const stale = await call(
      "PATCH",
      `/content/ministry-categories/${category.id}`,
      { cookie: adminCookie, body: { ...body, version: 1 } },
    );
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");

    const deleted = await call(
      "DELETE",
      `/content/ministry-categories/${category.id}`,
      { cookie: adminCookie },
    );
    expect(deleted.status).toBe(204);
    const listed = await call("GET", "/content/ministry-categories", {
      cookie: adminCookie,
    });
    const items = ((await listed.json()) as { items: MinistryCategoryDto[] })
      .items;
    expect(items.map((item) => item.id)).not.toContain(category.id);

    for (const action of [
      AUDIT_ACTIONS.ministryCategory.created,
      AUDIT_ACTIONS.ministryCategory.updated,
      AUDIT_ACTIONS.ministryCategory.deleted,
    ]) {
      const rows = await auditRowsOf({ entityId: category.id, action });
      expect(rows).toHaveLength(1);
    }
    const [updatedRow] = await auditRowsOf({
      entityId: category.id,
      action: AUDIT_ACTIONS.ministryCategory.updated,
    });
    expect(updatedRow?.before).toMatchObject({ version: 1 });
    expect(updatedRow?.after).toMatchObject({ version: 2 });
  });

  test("a category a ministry uses cannot be deleted (category_in_use)", async () => {
    const category = (await (
      await createCategory(body)
    ).json()) as MinistryCategoryDto;
    const id = await createMinistry("Con categoría");
    await call("PATCH", `/content/ministries/${id}/settings`, {
      cookie: adminCookie,
      body: settingsBody({ categoryId: category.id }),
    });
    const res = await call(
      "DELETE",
      `/content/ministry-categories/${category.id}`,
      { cookie: adminCookie },
    );
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("category_in_use");
  });

  test("the default language is required and only enabled languages are accepted", async () => {
    const noDefault = await call("POST", "/content/ministry-categories", {
      cookie: adminCookie,
      body: { order: 1, translations: { en: { name: "Grow" } } },
    });
    expect(noDefault.status).toBe(400);
    const disabled = await call("POST", "/content/ministry-categories", {
      cookie: adminCookie,
      body: {
        order: 1,
        translations: { es: { name: "Crecer" }, fr: { name: "Grandir" } },
      },
    });
    expect(disabled.status).toBe(400);
  });
});

describe("PUT /content/ministries/:id/leaders", () => {
  async function person(name: string): Promise<string> {
    const created = await db.personProfile.create({
      data: { organizationId: await resolveOrganizationId(), name },
    });
    return created.id;
  }
  const leader = (personProfileId: string, overrides = {}) => ({
    personProfileId,
    order: 0,
    translations: { es: { title: "Líder" } },
    ...overrides,
  });

  test("replaces the whole list, hidden by default, with before and after", async () => {
    const id = await createMinistry("Responsables");
    const ana = await person("Zz Leaders Ana");
    const beto = await person("Zz Leaders Beto");
    try {
      const first = await call("PUT", `/content/ministries/${id}/leaders`, {
        cookie: adminCookie,
        body: [leader(ana), leader(beto, { visible: true, order: 1 })],
      });
      expect(first.status).toBe(200);
      const { items } = (await first.json()) as MinistryLeadersDto;
      expect(items.map(({ name, visible }) => ({ name, visible }))).toEqual([
        { name: "Zz Leaders Ana", visible: false },
        { name: "Zz Leaders Beto", visible: true },
      ]);

      const second = await call("PUT", `/content/ministries/${id}/leaders`, {
        cookie: adminCookie,
        body: [leader(beto, { visible: false })],
      });
      expect(
        ((await second.json()) as MinistryLeadersDto).items.map((i) => i.name),
      ).toEqual(["Zz Leaders Beto"]);
      expect(
        await db.personRole.count({
          where: { ministryId: id, context: "MINISTRY_LEADER" },
        }),
      ).toBe(1);

      const [, audit] = await auditRowsOf({
        entityId: id,
        action: AUDIT_ACTIONS.ministry.leadersUpdated,
      });
      expect(audit?.before).toHaveLength(2);
      expect(audit?.after).toHaveLength(1);
    } finally {
      await db.personProfile.deleteMany({
        where: { id: { in: [ana, beto] } },
      });
    }
  });

  test("a person that is not a profile of the church is a 400 invalid_person", async () => {
    const id = await createMinistry("Sin persona");
    const res = await call("PUT", `/content/ministries/${id}/leaders`, {
      cookie: adminCookie,
      body: [leader(crypto.randomUUID())],
    });
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_person");
  });

  test("a language that is not enabled, more than 12 people or an unknown ministry are refused", async () => {
    const id = await createMinistry("Límites");
    const ana = await person("Zz Leaders Límite");
    try {
      const disabled = await call("PUT", `/content/ministries/${id}/leaders`, {
        cookie: adminCookie,
        body: [
          leader(ana, {
            translations: { es: { title: "x" }, fr: { title: "y" } },
          }),
        ],
      });
      expect(disabled.status).toBe(400);
      const many = await call("PUT", `/content/ministries/${id}/leaders`, {
        cookie: adminCookie,
        body: Array.from({ length: 13 }, () => leader(crypto.randomUUID())),
      });
      expect(many.status).toBe(400);
      const unknown = await call(
        "PUT",
        `/content/ministries/${crypto.randomUUID()}/leaders`,
        { cookie: adminCookie, body: [leader(ana)] },
      );
      expect(unknown.status).toBe(404);
    } finally {
      await db.personProfile.deleteMany({ where: { id: ana } });
    }
  });
});

describe("PATCH /content/ministries/landing", () => {
  const tile = (id: string, overrides = {}) => ({
    id,
    showOnLanding: true,
    landingOrder: 1,
    landingTile: "color",
    landingTone: "ink",
    ...overrides,
  });

  test("updates every tile in one transaction and audits before and after", async () => {
    const a = await createMinistry("Mosaico A");
    const b = await createMinistry("Mosaico B");
    const res = await call("PATCH", "/content/ministries/landing", {
      cookie: adminCookie,
      body: [
        tile(a, { landingOrder: 7 }),
        tile(b, { landingTone: "red", landingOrder: 8 }),
      ],
    });
    expect(res.status).toBe(200);
    const items = ((await res.json()) as MinistryListDto).items;
    expect(items.find((item) => item.id === a)).toMatchObject({
      showOnLanding: true,
      landingOrder: 7,
      landingTone: "ink",
    });
    expect(items.find((item) => item.id === b)?.landingTone).toBe("red");

    const rows = await auditRowsOf({
      action: AUDIT_ACTIONS.ministry.landingUpdated,
    });
    const mine = rows.find((row) =>
      (row.after as { id: string }[]).some((entry) => entry.id === a),
    );
    expect(mine?.before).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: a, showOnLanding: false }),
      ]),
    );
  });

  test("a photo from another church is a 400 invalid_media and nothing changes", async () => {
    const id = await createMinistry("Mosaico foto");
    const res = await call("PATCH", "/content/ministries/landing", {
      cookie: adminCookie,
      body: [
        tile(id, { landingTile: "photo", landingPhotoId: foreignMediaId }),
      ],
    });
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_media");
    const row = await db.ministry.findUniqueOrThrow({ where: { id } });
    expect(row.showOnLanding).toBe(false);
  });

  test("an unknown ministry is a 404", async () => {
    const res = await call("PATCH", "/content/ministries/landing", {
      cookie: adminCookie,
      body: [tile(crypto.randomUUID())],
    });
    expect(res.status).toBe(404);
  });
});
