import { describe, expect, test } from "bun:test";
import {
  incompleteLocales,
  pickTranslated,
  toLocaleTexts,
  toTranslations,
  validateTexts,
} from "./translatedText";

const LOCALES = ["es", "en", "pt"] as const;
const pickName = (translation: { name: string }): string => translation.name;

describe("translated text", () => {
  test("fills every locale and leaves the missing ones blank", () => {
    const texts = toLocaleTexts(
      { es: { name: "Culto" }, en: { name: "Service" } },
      pickName,
      LOCALES,
    );
    expect(texts).toEqual({ es: "Culto", en: "Service", pt: "" });
  });

  test("the default language always goes and blank texts of the others are left out", () => {
    const body = toTranslations({ es: "  Culto ", en: "", pt: " " }, "es", (name) => ({ name }));
    expect(body).toEqual({ es: { name: "Culto" } });
  });

  test("a blank default language is still sent so the API rejects it", () => {
    expect(toTranslations({ es: "", en: "Service" }, "es", (name) => ({ name }))).toEqual({
      es: { name: "" },
      en: { name: "Service" },
    });
  });

  test("requires the default language and limits the length of each text", () => {
    const errors = validateTexts({ es: " ", en: "x".repeat(61), pt: "" }, "es", 60);
    expect(Object.keys(errors).sort()).toEqual(["en", "es"]);
    expect(validateTexts({ es: "Culto", en: "", pt: "" }, "es", 60)).toEqual({});
  });

  test("flags the locales still blank", () => {
    expect(incompleteLocales({ es: "a", en: "", pt: " " }, LOCALES)).toEqual(["en", "pt"]);
  });

  test("picks the default language, then the first one, then the fallback", () => {
    const translations = { en: { name: "Service" }, es: { name: "Culto" } };
    expect(pickTranslated(translations, pickName, "es", "Sin nombre")).toBe("Culto");
    expect(pickTranslated({ en: { name: "Service" } }, pickName, "es", "Sin nombre")).toBe(
      "Service",
    );
    expect(pickTranslated({}, pickName, "es", "Sin nombre")).toBe("Sin nombre");
  });
});
