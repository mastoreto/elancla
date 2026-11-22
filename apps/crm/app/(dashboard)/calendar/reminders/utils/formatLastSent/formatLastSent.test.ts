import { describe, expect, test } from "bun:test";
import { formatLastSent } from "./formatLastSent";

describe("formatLastSent", () => {
  test("writes the date of the last reminder", () => {
    expect(formatLastSent("2026-12-03")).toBe("Último envío: 3 dic 2026");
  });

  test("says so when no reminder was ever sent", () => {
    expect(formatLastSent(null)).toContain("Todavía no");
  });
});
