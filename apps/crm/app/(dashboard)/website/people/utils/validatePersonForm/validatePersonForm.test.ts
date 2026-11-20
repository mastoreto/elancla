import { describe, expect, test } from "bun:test";
import { toPersonFormValues } from "../personFormValues";
import { hasFormErrors, validatePersonForm } from "./validatePersonForm";

const SITE = { locales: ["es", "en"], defaultLocale: "es" };

function validValues() {
  const values = toPersonFormValues(null, SITE.locales);
  values.name = "Ana";
  return values;
}

describe("validatePersonForm", () => {
  test("a name and no team title is valid", () => {
    expect(hasFormErrors(validatePersonForm(validValues(), SITE))).toBe(false);
  });

  test("requires a name and caps its length", () => {
    const values = validValues();
    values.name = "   ";
    expect(validatePersonForm(values, SITE).name).toBeDefined();
    values.name = "a".repeat(121);
    expect(validatePersonForm(values, SITE).name).toBeDefined();
  });

  test("the order is an integer from 0 to 9999", () => {
    const values = validValues();
    for (const invalid of ["", "-1", "1.5", "abc", "10000"]) {
      values.team.order = invalid;
      expect(validatePersonForm(values, SITE).order).toBeDefined();
    }
    values.team.order = "9999";
    expect(validatePersonForm(values, SITE).order).toBeUndefined();
  });

  test("a title in another language needs the default language one", () => {
    const values = validValues();
    values.team.titles = { es: "", en: "Pastor" };
    expect(validatePersonForm(values, SITE).teamTitle).toBeDefined();
    values.team.titles = { es: "Pastor", en: "" };
    expect(validatePersonForm(values, SITE).teamTitle).toBeUndefined();
  });

  test("caps the title at 80 and the bio at 600 characters", () => {
    const values = validValues();
    values.team.titles = { es: "t".repeat(81), en: "" };
    values.bios = { es: "b".repeat(601), en: "" };
    const errors = validatePersonForm(values, SITE);
    expect(errors.teamTitle).toBeDefined();
    expect(errors.bio).toBeDefined();
  });
});
