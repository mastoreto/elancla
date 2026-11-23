import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { publicSiteSettingsDto } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import { resolveOrganizationId } from "../../core/tenancy";
import { PUBLIC_CACHE_CONTROL } from "./public.routes";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const SEO_ES = "Descripción en español (test)";
const SECTION_KEYS = ["blog", "calendar", "sermons", "ministries", "visit"];
const FORBIDDEN_KEYS = [
  "id",
  "organizationId",
  "version",
  "secretHash",
  "createdAt",
  "updatedAt",
  "about",
  "serviceTimesSummary",
];

let organizationId = "";
let slug = "";
let validKey = "";
let otherChurchKey = "";
let otherChurchSlug = "";
let settingsId = "";
let previousSections: Prisma.JsonValue = {};
let previousSeo: string | null = null;
let hadSpanishTranslation = false;
let previousPortugueseSeo: string | null = null;

const portugueseTranslation = () => ({
  siteSettingsId_locale: { siteSettingsId: settingsId, locale: "pt" },
});

const spanishTranslation = () => ({
  siteSettingsId_locale: { siteSettingsId: settingsId, locale: "es" },
});

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  slug = (
    await db.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { slug: true },
    })
  ).slug;
  validKey = (await fixtures.createSiteKey(organizationId)).key;
  const other = await fixtures.createOrganization("other-church");
  otherChurchSlug = other.slug;
  otherChurchKey = (await fixtures.createSiteKey(other.id)).key;

  const settings = await db.siteSettings.findFirstOrThrow({
    where: { organizationId },
  });
  settingsId = settings.id;
  previousSections = settings.sectionStatuses;
  const existing = await db.siteSettingsTranslation.findUnique({
    where: spanishTranslation(),
  });
  hadSpanishTranslation = existing !== null;
  previousSeo = existing?.seoDescription ?? null;
  await db.siteSettingsTranslation.upsert({
    where: spanishTranslation(),
    create: {
      siteSettingsId: settingsId,
      locale: "es",
      seoDescription: SEO_ES,
    },
    update: { seoDescription: SEO_ES },
  });
  // The seed translates every locale; Portuguese must have no description for the fallback case.
  const portuguese = await db.siteSettingsTranslation.findUnique({
    where: portugueseTranslation(),
  });
  previousPortugueseSeo = portuguese?.seoDescription ?? null;
  if (portuguese) {
    await db.siteSettingsTranslation.update({
      where: portugueseTranslation(),
      data: { seoDescription: null },
    });
  }
  // One configured section and one junk key: the response must complete and clean the map.
  await db.siteSettings.update({
    where: { id: settingsId },
    data: { sectionStatuses: { blog: "maintenance", gallery: "maintenance" } },
  });
});

afterAll(async () => {
  await db.siteSettings.update({
    where: { id: settingsId },
    data: { sectionStatuses: previousSections as Prisma.InputJsonValue },
  });
  if (hadSpanishTranslation) {
    await db.siteSettingsTranslation.update({
      where: spanishTranslation(),
      data: { seoDescription: previousSeo },
    });
  } else {
    await db.siteSettingsTranslation.delete({ where: spanishTranslation() });
  }
  await db.siteSettingsTranslation.updateMany({
    where: { siteSettingsId: settingsId, locale: "pt" },
    data: { seoDescription: previousPortugueseSeo },
  });
  await fixtures.cleanup();
});

function getSettings(
  churchSlug: string,
  authorization?: string,
  query = "",
): Promise<Response> {
  return call("GET", `/public/v1/${churchSlug}/settings${query}`, {
    headers: authorization ? { Authorization: authorization } : undefined,
  });
}

/** The error body without the per-request id, so cases can be compared. */
async function problemWithoutRequestId(res: Response): Promise<unknown> {
  const { requestId: _requestId, ...rest } = (await res.json()) as Record<
    string,
    unknown
  >;
  return rest;
}

describe("GET /api/public/v1/:churchSlug/settings authentication", () => {
  test("every failure is the same 401", async () => {
    const [sample] = validKey.match(/^sk_[0-9a-f-]{36}_/) ?? [];
    const revoked = await fixtures.createSiteKey(organizationId, {
      revoked: true,
    });
    const attempts: [string, Promise<Response>][] = [
      ["no header", getSettings(slug)],
      ["not a bearer", getSettings(slug, "Basic abc")],
      ["malformed key", getSettings(slug, "Bearer not-a-key")],
      [
        "unknown id",
        getSettings(
          slug,
          `Bearer ${validKey.replace(/^sk_[0-9a-f-]{36}/, `sk_${crypto.randomUUID()}`)}`,
        ),
      ],
      ["wrong secret", getSettings(slug, `Bearer ${sample}${"A".repeat(43)}`)],
      ["revoked key", getSettings(slug, `Bearer ${revoked.key}`)],
      [
        "key of another church on this slug",
        getSettings(slug, `Bearer ${otherChurchKey}`),
      ],
      [
        "key of this church on another slug",
        getSettings(otherChurchSlug, `Bearer ${validKey}`),
      ],
    ];
    const bodies: unknown[] = [];
    for (const [label, pending] of attempts) {
      const res = await pending;
      expect(res.status, label).toBe(401);
      bodies.push(await problemWithoutRequestId(res));
    }
    for (const body of bodies) expect(body).toEqual(bodies[0]);
  });

  test("another church's key opens its own church", async () => {
    const res = await getSettings(otherChurchSlug, `Bearer ${otherChurchKey}`);
    // It authenticates; that church has no site settings.
    expect(res.status).toBe(404);
  });
});

describe("GET /api/public/v1/:churchSlug/settings response", () => {
  test("a valid key gets the settings with the public cache policy and no internals", async () => {
    const res = await getSettings(slug, `Bearer ${validKey}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(PUBLIC_CACHE_CONTROL);
    const body = (await res.json()) as Record<string, unknown>;
    expect(() => publicSiteSettingsDto.parse(body)).not.toThrow();
    const serialized = JSON.stringify(body);
    for (const key of FORBIDDEN_KEYS) {
      expect(serialized).not.toContain(`"${key}"`);
    }
    expect(body.locale).toBe("es");
    expect(body.seoDescription).toBe(SEO_ES);
    expect(Array.isArray(body.serviceTimes)).toBe(true);
  });

  test("sections always carry the five keys, completed and without unknown ones", async () => {
    const res = await getSettings(slug, `Bearer ${validKey}`);
    const { sections } = (await res.json()) as {
      sections: Record<string, string>;
    };
    expect(Object.keys(sections).sort()).toEqual([...SECTION_KEYS].sort());
    expect(sections.blog).toBe("maintenance");
    expect(sections.visit).toBe("active");
  });

  test("a locale without translation serves the default language and says so", async () => {
    const res = await getSettings(slug, `Bearer ${validKey}`, "?locale=pt");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      locale: string;
      seoDescription: string | null;
    };
    expect(body.locale).toBe("es");
    expect(body.seoDescription).toBe(SEO_ES);
  });

  test("a locale that is not valid is a 400", async () => {
    const res = await getSettings(slug, `Bearer ${validKey}`, "?locale=xx_yy");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/public/v1/openapi.json", () => {
  test("is public and describes only the public routes", async () => {
    const res = await call("GET", "/public/v1/openapi.json");
    expect(res.status).toBe(200);
    const document = (await res.json()) as { paths: Record<string, unknown> };
    expect(Object.keys(document.paths)).toEqual([
      "/{churchSlug}/settings",
      "/{churchSlug}/people",
      "/{churchSlug}/visit",
      "/{churchSlug}/pages",
      "/{churchSlug}/pages/{slug}",
      "/{churchSlug}/ministries",
      "/{churchSlug}/ministries/{slug}",
      "/{churchSlug}/posts",
      "/{churchSlug}/posts/{slug}",
      "/{churchSlug}/calendar",
      "/{churchSlug}/sermons",
      "/{churchSlug}/sermons/{slug}",
      "/{churchSlug}/live",
      "/{churchSlug}/posts/{slug}/views",
    ]);
  });
});

describe("authenticated routes keep private caching", () => {
  test("GET /api/health is no-store", async () => {
    const res = await call("GET", "/health");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });

  test("an authenticated 401 is no-store too", async () => {
    const res = await call("GET", "/roles");
    expect(res.status).toBe(401);
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
