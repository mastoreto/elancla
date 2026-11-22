import { describe, expect, test } from "bun:test";
import type { ResolvableSet } from "../resolveScheduleForDate";
import { resolveWeek } from "./resolveWeek";

const REGULAR: ResolvableSet = {
  id: "regular",
  validFrom: null,
  validTo: null,
  isDefault: true,
  forcedActive: false,
};
const HOLIDAY: ResolvableSet = {
  id: "holiday",
  validFrom: "2027-12-31",
  validTo: "2028-01-02",
  isDefault: false,
  forcedActive: false,
};

describe("resolveWeek", () => {
  test("covers today and the next six days with their weekday", () => {
    const week = resolveWeek({
      today: "2027-05-05",
      sets: [REGULAR],
      exceptions: [],
    });
    expect(week.map((day) => day.date)).toEqual([
      "2027-05-05",
      "2027-05-06",
      "2027-05-07",
      "2027-05-08",
      "2027-05-09",
      "2027-05-10",
      "2027-05-11",
    ]);
    expect(week.map((day) => day.weekday)).toEqual([3, 4, 5, 6, 0, 1, 2]);
  });

  test("resolves each day on its own, also across the year change", () => {
    const week = resolveWeek({
      today: "2027-12-29",
      sets: [REGULAR, HOLIDAY],
      exceptions: [{ date: "2028-01-01", replacementSetId: null }],
    });
    expect(week.map((day) => day.set?.id ?? null)).toEqual([
      "regular",
      "regular",
      "holiday",
      null,
      "holiday",
      "regular",
      "regular",
    ]);
  });
});
