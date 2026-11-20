import { describe, expect, test } from "bun:test";
import type { UpdateVisitBody } from "@ancla/contracts";
import { ValidationError } from "../../../../core/errors";
import { assertVisitLocales } from "./assertVisitLocales";

const organization = { locales: ["es", "en"], defaultLocale: "es" };
const text = { question: "Q", answer: "A" };
const blank = { parking: null, transit: null, accessibility: null };

const bodyOf = (overrides: Partial<UpdateVisitBody>): UpdateVisitBody => ({
  directions: {},
  faqs: [],
  ...overrides,
});

describe("assertVisitLocales", () => {
  test("accepts enabled languages with the default one in every FAQ", () => {
    expect(() =>
      assertVisitLocales(
        bodyOf({
          directions: { en: blank },
          faqs: [{ translations: { es: text, en: text } }],
        }),
        organization,
      ),
    ).not.toThrow();
  });

  test("rejects a direction language that is not enabled", () => {
    expect(() =>
      assertVisitLocales(bodyOf({ directions: { fr: blank } }), organization),
    ).toThrow(ValidationError);
  });

  test("rejects an FAQ language that is not enabled", () => {
    expect(() =>
      assertVisitLocales(
        bodyOf({ faqs: [{ translations: { es: text, fr: text } }] }),
        organization,
      ),
    ).toThrow(ValidationError);
  });

  test("rejects an FAQ without the default language", () => {
    expect(() =>
      assertVisitLocales(
        bodyOf({ faqs: [{ translations: { en: text } }] }),
        organization,
      ),
    ).toThrow(ValidationError);
  });
});
