import { describe, expect, test } from "bun:test";
import { MAX_VISIT_FAQS } from "@ancla/contracts";
import type { FaqFormValues } from "../../types";
import { addFaq, moveFaq, removeFaq } from "./faqList";

const faq = (key: string): FaqFormValues => ({ key, questions: {}, answers: {} });
const keys = (faqs: readonly FaqFormValues[]): string[] => faqs.map((item) => item.key);

describe("faqList", () => {
  test("addFaq appends an empty FAQ at the end", () => {
    expect(keys(addFaq([faq("a")], "b"))).toEqual(["a", "b"]);
  });

  test("addFaq stops at the API limit", () => {
    const full = Array.from({ length: MAX_VISIT_FAQS }, (_, index) => faq(String(index)));
    expect(addFaq(full, "extra")).toHaveLength(MAX_VISIT_FAQS);
  });

  test("removeFaq drops only that FAQ", () => {
    expect(keys(removeFaq([faq("a"), faq("b"), faq("c")], "b"))).toEqual(["a", "c"]);
  });

  test("moveFaq swaps with the neighbour", () => {
    const list = [faq("a"), faq("b"), faq("c")];
    expect(keys(moveFaq(list, "b", "up"))).toEqual(["b", "a", "c"]);
    expect(keys(moveFaq(list, "b", "down"))).toEqual(["a", "c", "b"]);
  });

  test("moveFaq at the edges or with an unknown key changes nothing", () => {
    const list = [faq("a"), faq("b")];
    expect(keys(moveFaq(list, "a", "up"))).toEqual(["a", "b"]);
    expect(keys(moveFaq(list, "b", "down"))).toEqual(["a", "b"]);
    expect(keys(moveFaq(list, "zzz", "up"))).toEqual(["a", "b"]);
  });

  test("moveFaq does not mutate its input", () => {
    const list = [faq("a"), faq("b")];
    moveFaq(list, "a", "down");
    expect(keys(list)).toEqual(["a", "b"]);
  });
});
