import { describe, expect, test } from "bun:test";
import { validateSimplePageLocales } from "./validateSimplePageLocales";

const organization = { locales: ["es", "en"], defaultLocale: "es" };
const translation = { title: "t", slug: "t", body: { type: "doc" } };

describe("validateSimplePageLocales", () => {
  test("accepts the default language alone or with other enabled ones", () => {
    expect(
      validateSimplePageLocales(
        { translations: { es: translation } },
        organization,
      ),
    ).toBeNull();
    expect(
      validateSimplePageLocales(
        { translations: { es: translation, en: translation } },
        organization,
      ),
    ).toBeNull();
  });

  test("requires the default language", () => {
    expect(
      validateSimplePageLocales(
        { translations: { en: translation } },
        organization,
      ),
    ).toContain("default");
  });

  test("rejects a language the organization does not serve", () => {
    expect(
      validateSimplePageLocales(
        { translations: { es: translation, pt: translation } },
        organization,
      ),
    ).toContain("pt");
  });
});
