import { describe, expect, test } from "bun:test";
import { toNullableText } from "./toNullableText";

describe("toNullableText", () => {
  test("a blank value becomes null", () => {
    expect(toNullableText("")).toBeNull();
    expect(toNullableText("   ")).toBeNull();
  });

  test("keeps the text, trimmed", () => {
    expect(toNullableText("  Calle 1 ")).toBe("Calle 1");
  });
});
