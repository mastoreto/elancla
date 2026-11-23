import { describe, expect, test } from "bun:test";
import { pickSermonTranslation } from "./pickSermonTranslation";

const translation = (title: string) => ({ title, slug: title, tags: [] });
const snapshot = {
  translations: { es: translation("uno"), en: translation("one") },
};
const served = { locale: "en", defaultLocale: "es" };

describe("pickSermonTranslation", () => {
  test("serves the requested language when the sermon has it", () => {
    expect(pickSermonTranslation(snapshot, served)?.locale).toBe("en");
  });

  test("falls back to the default language", () => {
    const picked = pickSermonTranslation(snapshot, { ...served, locale: "pt" });
    expect(picked?.locale).toBe("es");
  });

  test("is null when it has neither", () => {
    expect(pickSermonTranslation({ translations: {} }, served)).toBeNull();
  });
});
