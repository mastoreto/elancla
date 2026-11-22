import { describe, expect, test } from "bun:test";
import { resolveSelectedYear } from "./resolveSelectedYear";

describe("resolveSelectedYear", () => {
  test("an empty list of years has no selection", () => {
    expect(resolveSelectedYear({ requested: "2026", years: [], currentYear: 2026 })).toBeNull();
  });

  test("honors the requested year when it exists", () => {
    expect(resolveSelectedYear({ requested: "2025", years: [2025, 2026], currentYear: 2026 })).toBe(
      2025,
    );
  });

  test("falls back to the current year when the request is missing, invalid or unknown", () => {
    const years = [2025, 2026, 2027];
    expect(resolveSelectedYear({ requested: undefined, years, currentYear: 2026 })).toBe(2026);
    expect(resolveSelectedYear({ requested: "abc", years, currentYear: 2026 })).toBe(2026);
    expect(resolveSelectedYear({ requested: "1999", years, currentYear: 2026 })).toBe(2026);
  });

  test("falls back to the most recent year when the current one was never created", () => {
    expect(
      resolveSelectedYear({ requested: undefined, years: [2024, 2025], currentYear: 2026 }),
    ).toBe(2025);
  });
});
