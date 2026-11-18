import { describe, expect, test } from "bun:test";
import { formatCompactCount, formatCount, formatShortDate } from "./format-content";

describe("content formatters", () => {
  test("formats short dates and drafts", () => {
    expect(formatShortDate("2026-11-16")).toBe("16 nov");
    expect(formatShortDate("2026-01-05")).toBe("5 ene");
    expect(formatShortDate(undefined)).toBe("—");
  });

  test("groups thousands with dots", () => {
    expect(formatCount(1480)).toBe("1.480");
    expect(formatCount(780)).toBe("780");
    expect(formatCount(undefined)).toBe("—");
  });

  test("compacts thousands", () => {
    expect(formatCompactCount(41_200)).toBe("41,2 mil");
    expect(formatCompactCount(18_000)).toBe("18 mil");
    expect(formatCompactCount(640)).toBe("640");
  });
});
