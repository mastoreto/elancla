import { describe, expect, test } from "bun:test";
import {
  type DayActivityCandidate,
  selectDayActivities,
} from "./selectDayActivities";

const activity = (
  name: string,
  overrides: Partial<DayActivityCandidate> = {},
): DayActivityCandidate & { name: string } => ({
  name,
  scheduleSetId: "regular",
  weekday: 0,
  isPublic: true,
  isFixed: true,
  year: null,
  ...overrides,
});

const SUNDAY = { date: "2027-05-09", weekday: 0, set: { id: "regular" } };
const namesOf = (
  day: Parameters<typeof selectDayActivities>[0]["day"],
  activities: ReturnType<typeof activity>[],
  published: number[] = [],
): string[] =>
  selectDayActivities({
    day,
    activities,
    publishedYears: new Set(published),
  }).map((item) => (item as ReturnType<typeof activity>).name);

describe("selectDayActivities", () => {
  test("keeps the public activities of the set that fall on the weekday", () => {
    const activities = [
      activity("worship"),
      activity("monday", { weekday: 1 }),
      activity("other set", { scheduleSetId: "summer" }),
      activity("internal", { isPublic: false }),
    ];
    expect(namesOf(SUNDAY, activities)).toEqual(["worship"]);
  });

  test("a day without a set has nothing", () => {
    expect(namesOf({ ...SUNDAY, set: null }, [activity("worship")])).toEqual(
      [],
    );
  });

  test("activities of a year need that year published", () => {
    const ofYear = activity("choir", { isFixed: false, year: 2027 });
    expect(namesOf(SUNDAY, [ofYear])).toEqual([]);
    expect(namesOf(SUNDAY, [ofYear], [2027])).toEqual(["choir"]);
    expect(namesOf(SUNDAY, [ofYear], [2026])).toEqual([]);
  });

  test("the year is judged by the day: 31/12 with the new year unpublished keeps only the fixed", () => {
    const fixed = activity("worship", { weekday: 5 });
    const old = activity("old", { isFixed: false, year: 2027, weekday: 5 });
    const next = activity("new", { isFixed: false, year: 2028, weekday: 6 });
    const dec31 = { date: "2027-12-31", weekday: 5, set: { id: "regular" } };
    const jan1 = { date: "2028-01-01", weekday: 6, set: { id: "regular" } };
    expect(namesOf(dec31, [fixed, old, next], [2027])).toEqual([
      "worship",
      "old",
    ]);
    expect(namesOf(jan1, [fixed, old, next], [2027])).toEqual([]);
    expect(namesOf(jan1, [fixed, old, next], [2027, 2028])).toEqual(["new"]);
  });
});
