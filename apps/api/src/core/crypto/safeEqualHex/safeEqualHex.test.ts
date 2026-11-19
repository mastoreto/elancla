import { describe, expect, test } from "bun:test";
import { sha256Hex } from "../sha256Hex";
import { safeEqualHex } from "./safeEqualHex";

describe("safeEqualHex", () => {
  test("accepts the same digest and rejects another one", () => {
    expect(safeEqualHex(sha256Hex("a"), sha256Hex("a"))).toBe(true);
    expect(safeEqualHex(sha256Hex("a"), sha256Hex("b"))).toBe(false);
  });

  test("rejects digests of different length without throwing", () => {
    expect(safeEqualHex(sha256Hex("a"), "abcd")).toBe(false);
    expect(safeEqualHex("", sha256Hex("a"))).toBe(false);
  });
});
