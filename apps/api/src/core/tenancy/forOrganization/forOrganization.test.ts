import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { forOrganization } from "./forOrganization";

const suffix = crypto.randomUUID().slice(0, 8);
const orgData = (slug: string) => ({
  slug,
  name: slug,
  country: "UY",
  timezone: "America/Montevideo",
  defaultLocale: "es",
  locales: ["es"],
  currencies: ["UYU"],
});
const settings = (name: string) => ({ name, url: "https://example.test" });

let orgA = "";
let orgB = "";
let settingsB = "";

beforeAll(async () => {
  const a = await db.organization.create({
    data: orgData(`tenant-a-${suffix}`),
    select: { id: true },
  });
  const b = await db.organization.create({
    data: {
      ...orgData(`tenant-b-${suffix}`),
      siteSettings: { create: settings("Org B settings") },
    },
    select: { id: true, siteSettings: { select: { id: true } } },
  });
  orgA = a.id;
  orgB = b.id;
  settingsB = b.siteSettings?.id ?? "";
});

afterAll(async () => {
  // SiteSettings and sequences cascade with the organization.
  await db.organization.deleteMany({ where: { id: { in: [orgA, orgB] } } });
  await db.$disconnect();
});

describe("forOrganization", () => {
  test("a client for A does not see the SiteSettings of B", async () => {
    const tenantA = forOrganization(db, orgA);
    expect(
      await tenantA.siteSettings.findMany({ select: { id: true } }),
    ).toEqual([]);
    expect(
      await tenantA.siteSettings.findUnique({ where: { id: settingsB } }),
    ).toBeNull();
    expect(await tenantA.siteSettings.count()).toBe(0);
  });

  test("a client for B sees its own row", async () => {
    const tenantB = forOrganization(db, orgB);
    expect(await tenantB.siteSettings.count()).toBe(1);
  });

  test("A cannot update B's row", async () => {
    const tenantA = forOrganization(db, orgA);
    const result = await tenantA.siteSettings.updateMany({
      where: { id: settingsB },
      data: { name: "hijacked" },
    });
    expect(result.count).toBe(0);
    // PrismaPromise is lazy; wrap it so the call actually runs.
    await expect(
      Promise.resolve(
        tenantA.siteSettings.update({
          where: { id: settingsB },
          data: { name: "hijacked" },
        }),
      ),
    ).rejects.toThrow();
    const row = await db.siteSettings.findUnique({ where: { id: settingsB } });
    expect(row?.name).toBe("Org B settings");
  });

  test("A cannot delete B's row", async () => {
    const tenantA = forOrganization(db, orgA);
    expect(
      (await tenantA.siteSettings.deleteMany({ where: { id: settingsB } }))
        .count,
    ).toBe(0);
    expect(await db.siteSettings.count({ where: { id: settingsB } })).toBe(1);
  });

  test("create assigns the organization of the client, even if another is passed", async () => {
    const tenantA = forOrganization(db, orgA);
    const created = await tenantA.siteSettings.create({
      data: { ...settings("Org A settings"), organizationId: orgB },
    });
    expect(created.organizationId).toBe(orgA);
  });

  test("an update cannot move a row to another organization", async () => {
    const tenantA = forOrganization(db, orgA);
    await tenantA.siteSettings.updateMany({
      data: { organizationId: orgB, name: "renamed" },
    });
    const row = await db.siteSettings.findFirst({ where: { name: "renamed" } });
    expect(row?.organizationId).toBe(orgA);
  });

  test("models outside TENANT_MODELS pass through untouched", async () => {
    const tenantA = forOrganization(db, orgA);
    expect(await tenantA.organization.count({ where: { id: orgB } })).toBe(1);
  });
});
