import { describe, expect, test } from "bun:test";
import { suggestNewYear } from "./suggestNewYear";

describe("suggestNewYear", () => {
  test("starts at the current year when no year exists", () => {
    expect(suggestNewYear([], 2026)).toBe(2026);
  });

  test("suggests the year after the latest one", () => {
    expect(suggestNewYear([2025, 2027, 2026], 2026)).toBe(2028);
  });
});
