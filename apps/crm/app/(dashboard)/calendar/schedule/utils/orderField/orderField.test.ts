import { describe, expect, test } from "bun:test";
import { nextOrderAfter, parseOrder } from "./orderField";

describe("order field", () => {
  test("accepts integers from 0 to the maximum", () => {
    expect(parseOrder("0")).toBe(0);
    expect(parseOrder(" 12 ")).toBe(12);
    expect(parseOrder("1000")).toBe(1000);
  });

  test("rejects blanks, decimals, negatives and numbers over the maximum", () => {
    for (const text of ["", "1.5", "-1", "abc", "1001", "10000"]) {
      expect(parseOrder(text)).toBeNull();
    }
  });

  test("a new entity goes after the highest order", () => {
    expect(nextOrderAfter([])).toBe(0);
    expect(nextOrderAfter([0, 4, 2])).toBe(5);
  });
});
