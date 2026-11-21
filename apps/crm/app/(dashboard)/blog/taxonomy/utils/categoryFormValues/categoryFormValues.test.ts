import { describe, expect, test } from "bun:test";
import type { CategoryDto } from "@ancla/contracts";
import {
  toCategoryFormValues,
  toUpdateCategoryBody,
  toUpsertCategoryBody,
  validateCategoryForm,
} from "./categoryFormValues";

const LOCALES = ["es", "en", "pt"] as const;
const category: CategoryDto = {
  id: "11111111-1111-4111-8111-111111111111",
  order: 2,
  version: 4,
  translations: {
    es: { name: "Reflexión", slug: "reflexion" },
    en: { name: "Reflection", slug: "reflection" },
  },
};

describe("category form values", () => {
  test("fills every locale and leaves the missing ones blank", () => {
    const values = toCategoryFormValues(category, LOCALES);
    expect(values.order).toBe("2");
    expect(values.translations.pt).toEqual({ name: "", slug: "", slugEdited: false });
    expect(values.translations.es?.slugEdited).toBe(true);
  });

  test("round trips: the unedited form sends every language the category had", () => {
    const body = toUpsertCategoryBody(toCategoryFormValues(category, LOCALES), "es");
    expect(body).toEqual({ order: 2, translations: category.translations });
  });

  test("a blank language is left out so the PATCH removes it, the default one stays", () => {
    const values = toCategoryFormValues(category, LOCALES);
    values.translations.en = { name: "", slug: "", slugEdited: false };
    values.translations.es = { name: "", slug: "", slugEdited: false };
    expect(Object.keys(toUpsertCategoryBody(values, "es").translations)).toEqual(["es"]);
  });

  test("the update body carries the version read", () => {
    expect(toUpdateCategoryBody(toCategoryFormValues(category, LOCALES), "es", 4).version).toBe(4);
  });

  test("validation points at the field of the language", () => {
    const values = toCategoryFormValues(null, LOCALES);
    expect(validateCategoryForm(values, "es").translations.es?.name).toBeDefined();
    values.translations.es = { name: "Fe", slug: "fe", slugEdited: false };
    values.translations.en = { name: "Faith", slug: "Bad Slug", slugEdited: true };
    const errors = validateCategoryForm(values, "es");
    expect(errors.translations.es).toBeUndefined();
    expect(errors.translations.en?.slug).toBeDefined();
  });

  test("the order is an integer from 0 to 9999", () => {
    const values = toCategoryFormValues(category, LOCALES);
    for (const invalid of ["", "-1", "1.5", "abc", "10000"]) {
      values.order = invalid;
      expect(validateCategoryForm(values, "es").order).toBeDefined();
    }
    values.order = "9999";
    expect(validateCategoryForm(values, "es").order).toBeUndefined();
  });
});
