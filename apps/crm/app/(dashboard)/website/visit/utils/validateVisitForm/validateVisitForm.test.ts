import { describe, expect, test } from "bun:test";
import { VISIT_DIRECTION_MAX_LENGTH, VISIT_FAQ_ANSWER_MAX_LENGTH } from "@ancla/contracts";
import type { SiteLocales, VisitFormValues } from "../../types";
import { hasVisitErrors, validateVisitForm } from "./validateVisitForm";

const site: SiteLocales = { locales: ["es", "en"], defaultLocale: "es" };
const emptyDirections = { parking: {}, transit: {}, accessibility: {} };
const form = (faqs: VisitFormValues["faqs"]): VisitFormValues => ({
  directions: emptyDirections,
  faqs,
});

describe("validateVisitForm", () => {
  test("an empty form and a complete FAQ are valid", () => {
    expect(hasVisitErrors(validateVisitForm(form([]), site))).toBe(false);
    const complete = form([{ key: "a", questions: { es: "¿Q?" }, answers: { es: "A" } }]);
    expect(hasVisitErrors(validateVisitForm(complete, site))).toBe(false);
  });

  test("a FAQ without the default-locale question and answer is blocked", () => {
    const errors = validateVisitForm(
      form([{ key: "a", questions: { en: "Q" }, answers: { en: "A" } }]),
      site,
    );
    expect(errors.faqs.a?.question).toContain("obligatorio");
    expect(errors.faqs.a?.answer).toContain("obligatorio");
  });

  test("a half-filled language is reported", () => {
    const errors = validateVisitForm(
      form([{ key: "a", questions: { es: "Q", en: "Q" }, answers: { es: "A" } }]),
      site,
    );
    expect(errors.faqs.a?.answer).toContain("idioma");
  });

  test("whitespace counts as empty and length is checked after trimming", () => {
    const blank = validateVisitForm(
      form([{ key: "a", questions: { es: "  " }, answers: {} }]),
      site,
    );
    expect(blank.faqs.a?.question).toBeDefined();
    const long = "x".repeat(VISIT_FAQ_ANSWER_MAX_LENGTH + 1);
    const tooLong = validateVisitForm(
      form([{ key: "a", questions: { es: "Q" }, answers: { es: long } }]),
      site,
    );
    expect(tooLong.faqs.a?.answer).toContain(String(VISIT_FAQ_ANSWER_MAX_LENGTH));
  });

  test("a direction over the limit is reported by key", () => {
    const errors = validateVisitForm(
      {
        directions: {
          ...emptyDirections,
          transit: { en: "x".repeat(VISIT_DIRECTION_MAX_LENGTH + 1) },
        },
        faqs: [],
      },
      site,
    );
    expect(errors.directions.transit).toBeDefined();
    expect(errors.directions.parking).toBeUndefined();
  });
});
