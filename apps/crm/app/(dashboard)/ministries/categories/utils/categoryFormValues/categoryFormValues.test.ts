import { describe, expect, test } from "bun:test";
import type { MinistryCategoryDto } from "@ancla/contracts";
import {
  hasCategoryErrors,
  toCategoryFormValues,
  toUpdateCategoryBody,
  toUpsertCategoryBody,
  validateCategoryForm,
} from "./categoryFormValues";

const LOCALES = ["es", "en", "pt"] as const;

const category: MinistryCategoryDto = {
  id: "11111111-1111-4111-8111-111111111111",
  order: 2,
  version: 4,
  translations: { es: { name: "Alabanza" }, en: { name: "Worship" } },
};

describe("category form values", () => {
  test("fills every locale and leaves the missing ones blank", () => {
    const values = toCategoryFormValues(category, LOCALES);
    expect(values.order).toBe("2");
    expect(values.names).toEqual({ es: "Alabanza", en: "Worship", pt: "" });
  });

  test("a new category starts at the order it was given", () => {
    expect(toCategoryFormValues(null, LOCALES, 5).order).toBe("5");
  });

  test("round trips: the unedited form sends every language the category had", () => {
    const body = toUpsertCategoryBody(toCategoryFormValues(category, LOCALES), "es");
    expect(body).toEqual({ order: 2, translations: category.translations });
  });

  test("a blank language is left out so the PATCH removes it, the default one stays", () => {
    const values = toCategoryFormValues(category, LOCALES);
    values.names = { es: "", en: "", pt: "" };
    expect(Object.keys(toUpsertCategoryBody(values, "es").translations)).toEqual(["es"]);
  });

  test("the update body carries the version read", () => {
    expect(toUpdateCategoryBody(toCategoryFormValues(category, LOCALES), "es", 4).version).toBe(4);
  });

  test("validation points at the language that fails", () => {
    const values = toCategoryFormValues(null, LOCALES);
    expect(validateCategoryForm(values, "es").names.es).toBeDefined();
    values.names = { es: "Fe", en: "x".repeat(61), pt: "" };
    const errors = validateCategoryForm(values, "es");
    expect(errors.names.es).toBeUndefined();
    expect(errors.names.en).toBeDefined();
    expect(errors.names.pt).toBeUndefined();
  });

  test("the order is an integer from 0 to 9999", () => {
    const values = toCategoryFormValues(category, LOCALES);
    for (const invalid of ["", "-1", "1.5", "abc", "10000"]) {
      values.order = invalid;
      expect(validateCategoryForm(values, "es").order).toBeDefined();
    }
    values.order = "9999";
    expect(hasCategoryErrors(validateCategoryForm(values, "es"))).toBe(false);
  });
});
