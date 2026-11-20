import { describe, expect, test } from "bun:test";
import { parseOptionalNumber } from "./parseOptionalNumber";

describe("parseOptionalNumber", () => {
  test("blank is a valid null", () => {
    expect(parseOptionalNumber("  ")).toEqual({ valid: true, value: null });
  });

  test("parses decimals with a point or a comma", () => {
    expect(parseOptionalNumber("-34.9")).toEqual({ valid: true, value: -34.9 });
    expect(parseOptionalNumber("-56,16")).toEqual({ valid: true, value: -56.16 });
  });

  test("rejects text", () => {
    expect(parseOptionalNumber("abc")).toEqual({ valid: false });
  });
});
