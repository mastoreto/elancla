import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  grant,
  PERMISSIONS,
  publicVisitDto,
  type UpdateVisitBody,
  type VisitContentDto,
  visitContentDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const DISABLED_LOCALE = "fr";
const SEO_MARKER = "SEO description (visit test)";

let organizationId = "";
let slug = "";
let siteKey = "";
let editorCookie = "";
let viewerCookie = "";
let settingsId = "";
let originalTranslations: Awaited<
  ReturnType<typeof db.siteSettingsTranslation.findMany>
> = [];

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  slug = (
    await db.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { slug: true },
    })
  ).slug;
  siteKey = (await fixtures.createSiteKey(organizationId)).key;
  settingsId = (
    await db.siteSettings.findFirstOrThrow({ where: { organizationId } })
  ).id;
  originalTranslations = await db.siteSettingsTranslation.findMany({
    where: { siteSettingsId: settingsId },
  });
  const auth = getAuth();
  editorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "visit-editor", [
      grant(PERMISSIONS.visit.view),
      grant(PERMISSIONS.visit.edit),
    ]),
  );
  viewerCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "visit-viewer", [
      grant(PERMISSIONS.visit.view),
    ]),
  );
});

afterAll(async () => {
  // Put the shared rows back as the test found them.
  await db.visitFaq.deleteMany({ where: { organizationId } });
  await db.siteSettingsTranslation.deleteMany({
    where: { siteSettingsId: settingsId },
  });
  await db.siteSettingsTranslation.createMany({ data: originalTranslations });
  await fixtures.cleanup();
});

const blank = { parking: null, transit: null, accessibility: null };

const faq = (question: string, extra: Record<string, string> = {}) => ({
  translations: {
    es: { question, answer: `${question} answer` },
    ...Object.fromEntries(
      Object.entries(extra).map(([locale, text]) => [
        locale,
        { question: text, answer: `${text} answer` },
      ]),
    ),
  },
});

function put(body: unknown, cookie = editorCookie): Promise<Response> {
  return call("PUT", "/site/visit", { cookie, body });
}

async function putOk(body: UpdateVisitBody): Promise<VisitContentDto> {
  const res = await put(body);
  expect(res.status).toBe(200);
  return (await res.json()) as VisitContentDto;
}

async function getAdmin(): Promise<VisitContentDto> {
  const res = await call("GET", "/site/visit", { cookie: editorCookie });
  expect(res.status).toBe(200);
  return (await res.json()) as VisitContentDto;
}

function getPublic(query = "", key = siteKey): Promise<Response> {
  return call("GET", `/public/v1/${slug}/visit${query}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
}

describe("GET /site/visit", () => {
  test("returns the admin DTO with the locales", async () => {
    const visit = await getAdmin();
    expect(() => visitContentDto.parse(visit)).not.toThrow();
    expect(visit.locales).toContain(visit.defaultLocale);
  });

  test("visit:view alone reads", async () => {
    const res = await call("GET", "/site/visit", { cookie: viewerCookie });
    expect(res.status).toBe(200);
  });
});

describe("PUT /site/visit", () => {
  test("visit:view cannot write", async () => {
    expect((await put({ directions: {}, faqs: [] }, viewerCookie)).status).toBe(
      403,
    );
  });

  test("an FAQ without the default language is a 400 and changes nothing", async () => {
    const before = await getAdmin();
    const res = await put({
      directions: {},
      faqs: [{ translations: { en: { question: "Q", answer: "A" } } }],
    });
    expect(res.status).toBe(400);
    expect(await getAdmin()).toEqual(before);
  });

  test("a language the organization does not use is a 400, in directions and in FAQs", async () => {
    expect(
      (await put({ directions: { [DISABLED_LOCALE]: blank }, faqs: [] }))
        .status,
    ).toBe(400);
    expect(
      (
        await put({
          directions: {},
          faqs: [faq("Q", { [DISABLED_LOCALE]: "Q" })],
        })
      ).status,
    ).toBe(400);
  });

  test("replaces the list in the order sent and drops the old FAQs", async () => {
    const first = await putOk({
      directions: {},
      faqs: [faq("One"), faq("Two"), faq("Three")],
    });
    expect(first.faqs.map((item) => item.translations.es?.question)).toEqual([
      "One",
      "Two",
      "Three",
    ]);
    expect(first.faqs.map((item) => item.order)).toEqual([0, 1, 2]);
    const oldIds = first.faqs.map((item) => item.id);

    await putOk({ directions: {}, faqs: [faq("Three"), faq("One")] });
    const stored = await getAdmin();
    expect(stored.faqs.map((item) => item.translations.es?.question)).toEqual([
      "Three",
      "One",
    ]);
    expect(stored.faqs.map((item) => item.order)).toEqual([0, 1]);
    expect(await db.visitFaq.count({ where: { id: { in: oldIds } } })).toBe(0);
  });

  test("an empty list clears the FAQ", async () => {
    await putOk({ directions: {}, faqs: [faq("Gone")] });
    expect((await putOk({ directions: {}, faqs: [] })).faqs).toEqual([]);
  });

  test("directions replace only the locales sent and never touch seoDescription", async () => {
    await db.siteSettingsTranslation.upsert({
      where: {
        siteSettingsId_locale: { siteSettingsId: settingsId, locale: "es" },
      },
      create: {
        siteSettingsId: settingsId,
        locale: "es",
        seoDescription: SEO_MARKER,
      },
      update: { seoDescription: SEO_MARKER },
    });
    const { locales } = await getAdmin();
    const [other] = locales.filter((locale) => locale !== "es");
    await putOk({
      directions: { [other as string]: { ...blank, parking: "Other lot" } },
      faqs: [],
    });
    const after = await putOk({
      directions: {
        es: { parking: "Calle libre", transit: null, accessibility: "Rampa" },
      },
      faqs: [],
    });
    expect(after.directions.es).toEqual({
      parking: "Calle libre",
      transit: null,
      accessibility: "Rampa",
    });
    expect(after.directions[other as string]?.parking).toBe("Other lot");
    const row = await db.siteSettingsTranslation.findUniqueOrThrow({
      where: {
        siteSettingsId_locale: { siteSettingsId: settingsId, locale: "es" },
      },
    });
    expect(row.seoDescription).toBe(SEO_MARKER);
  });

  test("creates the translation row when the locale had none, with no seoDescription", async () => {
    await db.siteSettingsTranslation.deleteMany({
      where: { siteSettingsId: settingsId, locale: "pt" },
    });
    await putOk({
      directions: { pt: { ...blank, transit: "Ônibus 10" } },
      faqs: [],
    });
    const row = await db.siteSettingsTranslation.findUniqueOrThrow({
      where: {
        siteSettingsId_locale: { siteSettingsId: settingsId, locale: "pt" },
      },
    });
    expect(row.directionsTransit).toBe("Ônibus 10");
    expect(row.seoDescription).toBeNull();
  });

  test("writes one visit.updated audit row with before and after and the request id", async () => {
    await putOk({ directions: {}, faqs: [faq("Before")] });
    const res = await put({ directions: {}, faqs: [faq("After")] });
    expect(res.status).toBe(200);
    const rows = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "visit.updated",
    });
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows[0]?.before)).toContain("Before");
    expect(JSON.stringify(rows[0]?.after)).toContain("After");
    expect(JSON.stringify(rows[0]?.before)).not.toContain("After");
  });
});

describe("GET /public/v1/:churchSlug/visit", () => {
  test("serves the content with the strict DTO, no ids and the cache policy", async () => {
    await putOk({
      directions: { es: { ...blank, parking: "Estacionamiento" } },
      faqs: [faq("Pregunta")],
    });
    const res = await getPublic();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
    const body = (await res.json()) as Record<string, unknown>;
    expect(() => publicVisitDto.parse(body)).not.toThrow();
    expect(JSON.stringify(body)).not.toContain('"id"');
    expect(body).toEqual({
      directions: {
        parking: "Estacionamiento",
        transit: null,
        accessibility: null,
      },
      faqs: [{ question: "Pregunta", answer: "Pregunta answer" }],
    });
  });

  test("falls back to the default language per direction and per FAQ", async () => {
    await db.siteSettingsTranslation.deleteMany({
      where: { siteSettingsId: settingsId, locale: { in: ["es", "pt"] } },
    });
    await putOk({
      directions: {
        es: {
          parking: "Parking es",
          transit: "Transit es",
          accessibility: null,
        },
        pt: { parking: "Parking pt", transit: null, accessibility: null },
      },
      faqs: [faq("Solo es"), faq("Ambos es", { pt: "Ambos pt" })],
    });
    const res = await getPublic("?locale=pt");
    const body = (await res.json()) as {
      directions: Record<string, string | null>;
      faqs: { question: string }[];
    };
    expect(body.directions).toEqual({
      parking: "Parking pt",
      transit: "Transit es",
      accessibility: null,
    });
    expect(body.faqs.map((item) => item.question)).toEqual([
      "Solo es",
      "Ambos pt",
    ]);
  });

  test("blank direction texts come out as null", async () => {
    await db.siteSettingsTranslation.deleteMany({
      where: { siteSettingsId: settingsId, locale: "es" },
    });
    await db.siteSettingsTranslation.create({
      data: {
        siteSettingsId: settingsId,
        locale: "es",
        directionsParking: "   ",
        directionsTransit: "",
      },
    });
    const body = (await (await getPublic("?locale=es")).json()) as {
      directions: Record<string, string | null>;
    };
    expect(body.directions).toEqual({
      parking: null,
      transit: null,
      accessibility: null,
    });
  });

  test("an invalid site key is a 401", async () => {
    expect((await getPublic("", "sk_bad")).status).toBe(401);
  });
});
