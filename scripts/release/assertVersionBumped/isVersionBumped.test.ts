import { describe, expect, test } from "bun:test";
import { isVersionBumped } from "./isVersionBumped";

describe("isVersionBumped", () => {
  test("a greater version than the last tag passes", () => {
    expect(isVersionBumped("0.2.0", "v0.1.0")).toBe(true);
    expect(isVersionBumped("0.1.1", "v0.1.0")).toBe(true);
    expect(isVersionBumped("1.0.0", "v0.9.9")).toBe(true);
  });

  test("the same or a lower version fails", () => {
    expect(isVersionBumped("0.1.0", "v0.1.0")).toBe(false);
    expect(isVersionBumped("0.0.9", "v0.1.0")).toBe(false);
  });

  test("compares numerically, not as text", () => {
    expect(isVersionBumped("0.10.0", "v0.9.0")).toBe(true);
  });

  test("without any tag, anything above 0.0.0 is a first release", () => {
    expect(isVersionBumped("0.1.0", null)).toBe(true);
    expect(isVersionBumped("0.0.0", null)).toBe(false);
  });
});
