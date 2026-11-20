import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  grant,
  PERMISSIONS,
  type SiteSettingsDto,
  siteSettingsDto,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const SEO_EN = "English description (site test)";
const SEO_ES = "Descripción en español (site test)";
const DISABLED_LOCALE = "fr";

let organizationId = "";
let editorCookie = "";
let viewerCookie = "";
let originalSettings: Awaited<
  ReturnType<typeof db.siteSettings.findFirstOrThrow>
>;
let originalTranslations: Awaited<
  ReturnType<typeof db.siteSettingsTranslation.findMany>
> = [];

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  originalSettings = await db.siteSettings.findFirstOrThrow({
    where: { organizationId },
  });
  originalTranslations = await db.siteSettingsTranslation.findMany({
    where: { siteSettingsId: originalSettings.id },
  });
  const auth = getAuth();
  editorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "site-editor", [
      grant(PERMISSIONS.site.view),
      grant(PERMISSIONS.site.edit),
    ]),
  );
  viewerCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "site-viewer", [
      grant(PERMISSIONS.site.view),
    ]),
  );
});

afterAll(async () => {
  // Put the shared row back exactly as the test found it.
  const {
    id,
    organizationId: _org,
    createdAt: _c,
    ...columns
  } = originalSettings;
  await db.siteSettings.update({
    where: { id },
    data: {
      ...columns,
      updatedAt: originalSettings.updatedAt,
      serviceTimes: columns.serviceTimes as Prisma.InputJsonValue,
      sectionStatuses: columns.sectionStatuses as Prisma.InputJsonValue,
    },
  });
  await db.siteSettingsTranslation.deleteMany({
    where: { siteSettingsId: id },
  });
  await db.siteSettingsTranslation.createMany({ data: originalTranslations });
  await fixtures.cleanup();
});

async function currentSettings(): Promise<SiteSettingsDto> {
  const res = await call("GET", "/site/settings", { cookie: editorCookie });
  expect(res.status).toBe(200);
  return (await res.json()) as SiteSettingsDto;
}

function patch(body: unknown, cookie = editorCookie): Promise<Response> {
  return call("PATCH", "/site/settings", { cookie, body });
}

describe("GET /site/settings", () => {
  test("returns the admin view with the version, the full section map and the locales", async () => {
    const settings = await currentSettings();
    expect(() => siteSettingsDto.parse(settings)).not.toThrow();
    expect(Object.keys(settings.sections).sort()).toEqual([
      "blog",
      "calendar",
      "ministries",
      "sermons",
      "visit",
    ]);
    expect(settings.locales).toContain(settings.defaultLocale);
  });

  test("site:view alone reads", async () => {
    const res = await call("GET", "/site/settings", { cookie: viewerCookie });
    expect(res.status).toBe(200);
  });
});

describe("PATCH /site/settings", () => {
  test("a body without version is a 400", async () => {
    expect((await patch({ subtitle: "x" })).status).toBe(400);
  });

  test("site:view cannot patch", async () => {
    const { version } = await currentSettings();
    expect((await patch({ version }, viewerCookie)).status).toBe(403);
  });

  test("a stale version is a 409 stale_version and changes nothing", async () => {
    const before = await currentSettings();
    const res = await patch({
      version: before.version + 100,
      subtitle: "never saved",
    });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { code: string }).code).toBe("stale_version");
    expect(await currentSettings()).toEqual(before);
  });

  test("saves, bumps the version and audits with the request id", async () => {
    const before = await currentSettings();
    const res = await patch({
      version: before.version,
      subtitle: "Subtitle (site test)",
      serviceTimes: [
        { kind: "worship", weekday: 0, start: "11:15", end: "13:00" },
        { kind: "bibleSchool", weekday: 0, start: "10:00", end: null },
      ],
      sections: { blog: "maintenance" },
      translations: { en: { seoDescription: SEO_EN } },
    });
    expect(res.status).toBe(200);
    const after = (await res.json()) as SiteSettingsDto;
    expect(after.version).toBe(before.version + 1);
    expect(after.subtitle).toBe("Subtitle (site test)");
    expect(after.serviceTimes).toHaveLength(2);
    // The map is replaced as a whole: keys that were left out are active again.
    expect(after.sections.blog).toBe("maintenance");
    expect(after.sections.visit).toBe("active");
    expect(after.translations.en?.seoDescription).toBe(SEO_EN);

    const rows = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "site.settingsUpdated",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.entityId).toBe(originalSettings.id);
    expect(JSON.stringify(rows[0])).toContain("Subtitle (site test)");
  });

  test("translations replace only the locales sent", async () => {
    const before = await currentSettings();
    const defaultLocale = before.defaultLocale;
    const res = await patch({
      version: before.version,
      translations: { [defaultLocale]: { seoDescription: SEO_ES } },
    });
    expect(res.status).toBe(200);
    const after = (await res.json()) as SiteSettingsDto;
    expect(after.translations[defaultLocale]?.seoDescription).toBe(SEO_ES);
    for (const [locale, translation] of Object.entries(before.translations)) {
      if (locale === defaultLocale) continue;
      expect(after.translations[locale]).toEqual(translation);
    }
  });

  test("a locale the organization does not use is a 400", async () => {
    const before = await currentSettings();
    const res = await patch({
      version: before.version,
      translations: { [DISABLED_LOCALE]: { seoDescription: "no" } },
    });
    expect(res.status).toBe(400);
    expect((await currentSettings()).version).toBe(before.version);
  });

  test.each([
    ["end equal to start", { start: "10:00", end: "10:00" }],
    ["end before start", { start: "12:00", end: "11:00" }],
  ])("a service time with %s is a 400", async (_label, times) => {
    const { version } = await currentSettings();
    const res = await patch({
      version,
      serviceTimes: [{ kind: "worship", weekday: 0, ...times }],
    });
    expect(res.status).toBe(400);
  });
});
