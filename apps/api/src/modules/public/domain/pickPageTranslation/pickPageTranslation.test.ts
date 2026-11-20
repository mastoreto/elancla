import { describe, expect, test } from "bun:test";
import { pickPageTranslation } from "./pickPageTranslation";

const translation = (title: string) => ({ title, slug: title, body: {} });
const snapshot = {
  translations: { es: translation("es"), en: translation("en") },
};

describe("pickPageTranslation", () => {
  test("serves the requested language when the page has it", () => {
    const picked = pickPageTranslation(snapshot, {
      locale: "en",
      defaultLocale: "es",
    });
    expect(picked?.locale).toBe("en");
  });

  test("falls back to the default language", () => {
    const picked = pickPageTranslation(snapshot, {
      locale: "pt",
      defaultLocale: "es",
    });
    expect(picked?.locale).toBe("es");
  });

  test("is null when the page has neither", () => {
    expect(
      pickPageTranslation(
        { translations: { en: translation("en") } },
        { locale: "pt", defaultLocale: "es" },
      ),
    ).toBeNull();
  });
});
