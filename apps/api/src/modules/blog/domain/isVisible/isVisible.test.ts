import { describe, expect, test } from "bun:test";
import { isVisible } from "./isVisible";

const now = new Date("2026-05-01T12:00:00Z");

describe("isVisible", () => {
  test("without publishAt it is visible", () => {
    expect(isVisible({}, now)).toBe(true);
  });

  test("a future publishAt is scheduled, not visible", () => {
    expect(isVisible({ publishAt: "2026-05-01T12:00:01Z" }, now)).toBe(false);
  });

  test("a past or equal publishAt is visible", () => {
    expect(isVisible({ publishAt: "2026-05-01T12:00:00Z" }, now)).toBe(true);
    expect(isVisible({ publishAt: "2026-04-30T00:00:00-03:00" }, now)).toBe(
      true,
    );
  });
});
