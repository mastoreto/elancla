import { describe, expect, test } from "bun:test";
import { formatMoney, formatMoneyCompact } from "./format-money";

describe("formatMoney", () => {
  test("groups thousands with a dot and prefixes the currency", () => {
    expect(formatMoney(15_000, "UYU")).toBe("$U 15.000");
    expect(formatMoney(320, "USD")).toBe("USD 320");
    expect(formatMoney(4500, "UYU")).toBe("$U 4.500");
  });
});

describe("formatMoneyCompact", () => {
  test("writes thousands as mil and millions as M", () => {
    expect(formatMoneyCompact(500_000, "UYU")).toBe("$U 500 mil");
    expect(formatMoneyCompact(2_100_000, "UYU")).toBe("$U 2,1 M");
    expect(formatMoneyCompact(750, "UYU")).toBe("$U 750");
  });

  test("the million unit also scales amounts below one million", () => {
    expect(formatMoneyCompact(400_000, "UYU", "million")).toBe("$U 0,4 M");
  });
});
