import { describe, expect, test } from "bun:test";
import { pickMinistryTranslation } from "./pickMinistryTranslation";

const snapshot = (...locales: string[]) => ({
  translations: Object.fromEntries(
    locales.map((locale) => [locale, { name: `name-${locale}` }]),
  ),
});
const served = { locale: "en", defaultLocale: "es" };

describe("pickMinistryTranslation", () => {
  test("serves the requested language when the profile has it", () => {
    expect(pickMinistryTranslation(snapshot("es", "en"), served)?.locale).toBe(
      "en",
    );
  });

  test("falls back to the default language", () => {
    expect(pickMinistryTranslation(snapshot("es"), served)?.locale).toBe("es");
  });

  test("a profile with neither language is unusable", () => {
    expect(pickMinistryTranslation(snapshot("pt"), served)).toBeNull();
  });
});
