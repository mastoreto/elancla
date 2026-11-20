import { describe, expect, test } from "bun:test";
import { MAX_VISIT_FAQS, updateVisitBody } from "./visitContentDto";

const faq = { translations: { es: { question: "Q", answer: "A" } } };
const emptyDirections = { parking: null, transit: null, accessibility: null };

describe("updateVisitBody", () => {
  test("accepts directions and a list of questions", () => {
    const result = updateVisitBody.safeParse({
      directions: { es: emptyDirections },
      faqs: [faq],
    });
    expect(result.success).toBe(true);
  });

  test("rejects more questions than the limit", () => {
    const result = updateVisitBody.safeParse({
      directions: {},
      faqs: Array.from({ length: MAX_VISIT_FAQS + 1 }, () => faq),
    });
    expect(result.success).toBe(false);
  });

  test("rejects an empty answer and a too-long direction", () => {
    expect(
      updateVisitBody.safeParse({
        directions: {},
        faqs: [{ translations: { es: { question: "Q", answer: " " } } }],
      }).success,
    ).toBe(false);
    expect(
      updateVisitBody.safeParse({
        directions: { es: { ...emptyDirections, parking: "x".repeat(601) } },
        faqs: [],
      }).success,
    ).toBe(false);
  });
});
