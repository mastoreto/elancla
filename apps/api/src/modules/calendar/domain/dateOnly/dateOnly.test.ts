import { describe, expect, test } from "bun:test";
import {
  addDays,
  formatDateOnly,
  parseDateOnly,
  weekdayOf,
  yearOf,
} from "./dateOnly";

describe("dateOnly", () => {
  test("round-trips a date through the database representation", () => {
    expect(formatDateOnly(parseDateOnly("2027-03-14"))).toBe("2027-03-14");
  });

  test("adds days across month and year boundaries", () => {
    expect(addDays("2027-12-31", 1)).toBe("2028-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-03-01", -1)).toBe("2027-02-28");
  });

  test("weekday follows Date#getDay (0 = Sunday)", () => {
    expect(weekdayOf("2027-05-02")).toBe(0);
    expect(weekdayOf("2027-05-08")).toBe(6);
  });

  test("year of a date", () => {
    expect(yearOf("2028-01-01")).toBe(2028);
  });
});
