import { describe, expect, test } from "bun:test";
import { fromDateTimeLocal, toDateTimeLocal, todayInputValue } from "./dateTimeLocal";

describe("dateTimeLocal", () => {
  test("an ISO datetime survives the round trip through the input value", () => {
    const iso = "2030-06-01T15:30:00.000Z";
    expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
  });

  test("blank or invalid values mean no date", () => {
    expect(toDateTimeLocal(undefined)).toBe("");
    expect(toDateTimeLocal("not a date")).toBe("");
    expect(fromDateTimeLocal("")).toBeUndefined();
    expect(fromDateTimeLocal("nope")).toBeUndefined();
  });

  test("today is padded as YYYY-MM-DD", () => {
    expect(todayInputValue(new Date(2030, 0, 5))).toBe("2030-01-05");
  });
});
