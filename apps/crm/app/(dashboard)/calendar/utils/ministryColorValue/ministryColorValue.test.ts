import { describe, expect, test } from "bun:test";
import { DEFAULT_MINISTRY_COLOR, MINISTRY_COLORS } from "@ancla/contracts";
import { ministryColorValue } from "./ministryColorValue";

describe("ministryColorValue", () => {
  test("every ministry color token resolves to a hex value", () => {
    for (const token of MINISTRY_COLORS) {
      expect(ministryColorValue(token)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  test("no ministry uses the default color", () => {
    expect(ministryColorValue(undefined)).toBe(ministryColorValue(DEFAULT_MINISTRY_COLOR));
  });
});
