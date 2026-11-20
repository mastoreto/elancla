import { describe, expect, test } from "bun:test";
import { toPostFormValues } from "../postFormValues";
import { hasPostFormErrors, validatePostForm } from "./validatePostForm";

const AUTHOR_ID = "0190a0b2-4c1d-7000-8000-000000000001";
const CATEGORY_ID = "0190a0b2-4c1d-7000-8000-000000000002";

function validForm() {
  const values = toPostFormValues(null, ["es"], "2030-01-05");
  const es = values.translations.es;
  if (!es) throw new Error("expected the es translation");
  es.title = "Título";
  es.slug = "titulo";
  es.excerpt = "Extracto";
  values.authorProfileId = AUTHOR_ID;
  values.categoryId = CATEGORY_ID;
  return values;
}

describe("validatePostForm", () => {
  test("a complete form has no errors", () => {
    expect(hasPostFormErrors(validatePostForm(validForm(), "es"))).toBe(false);
  });

  test("a blank form flags the default language and the missing author and category", () => {
    const errors = validatePostForm(toPostFormValues(null, ["es"], "2030-01-05"), "es");
    expect(errors.translations.es).toMatchObject({ title: expect.any(String) });
    expect(errors.translations.es?.slug).toContain("slug");
    expect(errors.general.authorProfileId).toBeDefined();
    expect(errors.general.categoryId).toBeDefined();
  });

  test("a bad slug is explained", () => {
    const values = validForm();
    const es = values.translations.es;
    if (es) es.slug = "Mal Slug";
    expect(validatePostForm(values, "es").translations.es?.slug).toContain("minúsculas");
  });

  test("a series without a position flags the position", () => {
    const values = validForm();
    values.seriesId = "0190a0b2-4c1d-7000-8000-000000000003";
    expect(validatePostForm(values, "es").general.seriesOrder).toBeDefined();
  });

  test("a photo cover without an uploaded file flags the cover", () => {
    const values = validForm();
    values.cover = { ...values.cover, kind: "photo" };
    expect(validatePostForm(values, "es").general.cover).toBeDefined();
  });
});
