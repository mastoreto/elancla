import { describe, expect, test } from "bun:test";
import type { RecurringActivityDto } from "@ancla/contracts";
import { describeTimeRange, groupByWeekday } from "./weekdays";

function activity(id: string, weekday: number, start: string): RecurringActivityDto {
  return {
    id,
    scheduleSetId: "11111111-1111-4111-8111-111111111111",
    weekday,
    start,
    end: null,
    placeId: null,
    serviceKind: null,
    isPublic: true,
    isFixed: true,
    year: null,
    annualReview: false,
    needsReview: false,
    ministryIds: [],
    version: 1,
    translations: { es: { title: id } },
  };
}

describe("weekdays", () => {
  test("groups by day starting on Sunday, ordered by start time, without empty days", () => {
    const groups = groupByWeekday([
      activity("c", 3, "19:00"),
      activity("b", 0, "11:00"),
      activity("a", 0, "09:00"),
    ]);
    expect(groups.map((group) => group.label)).toEqual(["Domingo", "Miércoles"]);
    expect(groups[0]?.activities.map((item) => item.id)).toEqual(["a", "b"]);
  });

  test("describes a time range with and without an end", () => {
    expect(describeTimeRange("10:00", null)).toBe("10:00");
    expect(describeTimeRange("10:00", "12:30")).toBe("10:00 – 12:30");
  });
});
