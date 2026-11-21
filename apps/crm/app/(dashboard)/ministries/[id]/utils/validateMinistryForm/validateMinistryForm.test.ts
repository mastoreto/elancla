import { describe, expect, test } from "bun:test";
import { toMinistryFormValues } from "../ministryFormValues";
import {
  describeSlugProblem,
  hasMinistryFormErrors,
  validateMinistryForm,
} from "./validateMinistryForm";

const LOCALES = ["es", "en"];

function validForm() {
  const values = toMinistryFormValues(null, LOCALES);
  const es = { ...values.translations.es, name: "Alabanza", slug: "alabanza", tagline: "Juntos" };
  return { ...values, translations: { ...values.translations, es } } as typeof values;
}

describe("describeSlugProblem", () => {
  test("accepts a kebab slug and explains the rest", () => {
    expect(describeSlugProblem("alabanza")).toBeNull();
    expect(describeSlugProblem("")).toContain("Escribe");
    expect(describeSlugProblem("Mala Idea")).toContain("minúsculas");
    expect(describeSlugProblem("a".repeat(81))).toContain("80");
  });
});

describe("validateMinistryForm", () => {
  test("a filled default language is valid and blank others are ignored", () => {
    expect(hasMinistryFormErrors(validateMinistryForm(validForm(), "es"))).toBe(false);
  });

  test("a blank default language points at its required fields", () => {
    const errors = validateMinistryForm(toMinistryFormValues(null, LOCALES), "es");
    expect(errors.translations.es?.name).toBeDefined();
    expect(errors.translations.es?.slug).toBeDefined();
    expect(errors.translations.es?.tagline).toBeDefined();
    expect(errors.translations.en).toBeUndefined();
  });

  test("an invalid optional text points at that field of that language", () => {
    const form = validForm();
    const es = { ...form.translations.es, place: "x".repeat(121) };
    const errors = validateMinistryForm(
      { ...form, translations: { ...form.translations, es } },
      "es",
    );
    expect(errors.translations.es?.place).toBeDefined();
    expect(errors.translations.es?.name).toBeUndefined();
  });

  test("an invalid media id is a general error", () => {
    const form = { ...validForm(), coverMediaId: "not-a-uuid" };
    expect(validateMinistryForm(form, "es").general.coverMediaId).toBeDefined();
  });
});
