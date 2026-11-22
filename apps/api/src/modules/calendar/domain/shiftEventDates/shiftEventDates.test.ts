import { describe, expect, test } from "bun:test";
import type { EventSnapshot } from "@ancla/contracts";
import { shiftEventDates } from "./shiftEventDates";

const snapshot = (overrides: Partial<EventSnapshot> = {}): EventSnapshot => ({
  translations: { es: { title: "Retiro" } },
  startDate: "2027-05-08",
  allDay: false,
  placeMode: "tbc",
  ministryIds: [],
  status: "scheduled",
  ...overrides,
});

describe("shiftEventDates", () => {
  test("moves the start to the same weekday of the target year", () => {
    const shifted = shiftEventDates({
      snapshot: snapshot(),
      toYear: 2028,
      keepExactDates: false,
    });
    expect(shifted.startDate).toBe("2028-05-06");
  });

  test("keepExactDates keeps the day of the month", () => {
    const shifted = shiftEventDates({
      snapshot: snapshot(),
      toYear: 2028,
      keepExactDates: true,
    });
    expect(shifted.startDate).toBe("2028-05-08");
  });

  test("a multi-day event keeps its length", () => {
    const shifted = shiftEventDates({
      snapshot: snapshot({ endDate: "2027-05-10" }),
      toYear: 2028,
      keepExactDates: false,
    });
    expect(shifted.startDate).toBe("2028-05-06");
    expect(shifted.endDate).toBe("2028-05-08");
  });

  test("a cancelled event comes back scheduled and the rest is kept", () => {
    const shifted = shiftEventDates({
      snapshot: snapshot({ status: "cancelled", startTime: "20:00" }),
      toYear: 2028,
      keepExactDates: true,
    });
    expect(shifted.status).toBe("scheduled");
    expect(shifted.startTime).toBe("20:00");
    expect(shifted.translations).toEqual({ es: { title: "Retiro" } });
  });
});
