import { describe, expect, test } from "bun:test";
import { generateAccessCode } from "./assembly-code";

describe("generateAccessCode", () => {
  test("builds an ASM- code from the readable alphabet", () => {
    expect(generateAccessCode(() => 0)).toBe("ASM-AAAAAA");
    expect(generateAccessCode(() => 0.999)).toBe("ASM-999999");
  });

  test("never emits ambiguous characters", () => {
    for (let index = 0; index < 50; index += 1) {
      expect(generateAccessCode()).toMatch(/^ASM-[A-HJ-NP-Z2-9]{6}$/);
    }
  });
});
