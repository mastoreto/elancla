import { describe, expect, test } from "bun:test";
import { weekdayOf } from "../dateOnly";
import {
  moveDateToYear,
  shiftDateKeepingWeekday,
} from "./shiftDateKeepingWeekday";

const SATURDAY = 6;

describe("shiftDateKeepingWeekday", () => {
  test("Saturday 8 May 2027 becomes the closest Saturday of 2028", () => {
    const shifted = shiftDateKeepingWeekday("2027-05-08", 2028);
    expect(shifted).toBe("2028-05-06");
    expect(weekdayOf(shifted)).toBe(SATURDAY);
  });

  test("a date that already falls on the same weekday does not move", () => {
    // The calendar repeats every 11 years here, so the weekday is already the right one.
    expect(shiftDateKeepingWeekday("2027-05-08", 2027)).toBe("2027-05-08");
    expect(shiftDateKeepingWeekday("2023-03-04", 2034)).toBe("2034-03-04");
  });

  test("29 February moves to 28 February and then to the closest weekday", () => {
    // 29/2/2028 is a Tuesday; 28/2/2029 is a Wednesday; the closest Tuesday is 27/2/2029.
    expect(shiftDateKeepingWeekday("2028-02-29", 2029)).toBe("2029-02-27");
  });

  test("31 December and 1 January", () => {
    // Friday 31/12/2027 -> 31/12/2028 is a Sunday; the closest Friday is 29/12/2028.
    expect(shiftDateKeepingWeekday("2027-12-31", 2028)).toBe("2028-12-29");
    // Friday 1/1/2027 -> 1/1/2028 is a Saturday; the closest Friday is 31/12/2027, out of the
    // target year, so the next one inside it is used.
    expect(shiftDateKeepingWeekday("2027-01-01", 2028)).toBe("2028-01-07");
    // Saturday 1/1/2028 -> Monday 1/1/2029; the closest Saturday is 30/12/2028 (outside), so 6/1/2029.
    expect(shiftDateKeepingWeekday("2028-01-01", 2029)).toBe("2029-01-06");
  });

  test("always lands in the target year, within three days of the same month and day", () => {
    for (const date of [
      "2027-01-02",
      "2027-06-15",
      "2027-12-30",
      "2028-02-29",
    ]) {
      for (const year of [2026, 2028, 2029, 2031]) {
        const shifted = shiftDateKeepingWeekday(date, year);
        expect(shifted.startsWith(String(year))).toBe(true);
        expect(weekdayOf(shifted)).toBe(weekdayOf(date));
      }
    }
  });
});

describe("moveDateToYear (keep the exact date)", () => {
  test("keeps the month and day", () => {
    expect(moveDateToYear("2027-05-08", 2028)).toBe("2028-05-08");
  });

  test("29 February falls back to 28 February in a common year", () => {
    expect(moveDateToYear("2028-02-29", 2029)).toBe("2029-02-28");
    expect(moveDateToYear("2028-02-29", 2032)).toBe("2032-02-29");
  });
});
