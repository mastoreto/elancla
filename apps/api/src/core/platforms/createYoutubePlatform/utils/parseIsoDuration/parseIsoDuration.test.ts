import { describe, expect, test } from "bun:test";
import { parseIsoDuration } from "./parseIsoDuration";

describe("parseIsoDuration", () => {
  test("converts hours, minutes and seconds", () => {
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723);
    expect(parseIsoDuration("PT45M")).toBe(2700);
    expect(parseIsoDuration("PT59S")).toBe(59);
    expect(parseIsoDuration("PT2H")).toBe(7200);
  });

  test("converts days and the zero duration of live streams", () => {
    expect(parseIsoDuration("P1DT1H")).toBe(90_000);
    expect(parseIsoDuration("P0D")).toBe(0);
  });

  test("is null for missing or malformed values", () => {
    expect(parseIsoDuration(undefined)).toBeNull();
    expect(parseIsoDuration("")).toBeNull();
    expect(parseIsoDuration("1:02:03")).toBeNull();
    expect(parseIsoDuration("PT-5S")).toBeNull();
  });
});
