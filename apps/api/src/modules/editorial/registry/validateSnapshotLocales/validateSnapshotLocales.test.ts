import { describe, expect, test } from "bun:test";
import { validateSnapshotLocales } from "./validateSnapshotLocales";

const organization = { locales: ["es", "en"], defaultLocale: "es" };
const translation = { title: "t", slug: "t", body: { type: "doc" } };

describe("validateSnapshotLocales", () => {
  test("accepts the default language alone or with other enabled ones", () => {
    expect(
      validateSnapshotLocales(
        { translations: { es: translation } },
        organization,
      ),
    ).toBeNull();
    expect(
      validateSnapshotLocales(
        { translations: { es: translation, en: translation } },
        organization,
      ),
    ).toBeNull();
  });

  test("requires the default language", () => {
    expect(
      validateSnapshotLocales(
        { translations: { en: translation } },
        organization,
      ),
    ).toContain("default");
  });

  test("rejects a language the organization does not serve", () => {
    expect(
      validateSnapshotLocales(
        { translations: { es: translation, pt: translation } },
        organization,
      ),
    ).toContain("pt");
  });
});
