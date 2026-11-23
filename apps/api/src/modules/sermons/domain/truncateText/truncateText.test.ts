import { describe, expect, test } from "bun:test";
import { truncateText } from "./truncateText";

describe("truncateText", () => {
  test("trims and leaves what fits", () => {
    expect(truncateText("  hola  ", 10)).toBe("hola");
  });

  test("cuts at the limit", () => {
    expect(truncateText("abcdefghij", 4)).toBe("abcd");
    expect(truncateText("abc defghij", 4)).toBe("abc");
  });

  test("never splits a surrogate pair", () => {
    const cut = truncateText("ab😀cd", 3);
    expect(cut).toBe("ab");
    expect(cut.length).toBeLessThanOrEqual(3);
  });
});
