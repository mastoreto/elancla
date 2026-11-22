import { describe, expect, test } from "bun:test";
import { formatEventWhen } from "./formatEventWhen";

const base = { startDate: "2026-03-14", startTime: null, endDate: null, allDay: false };

describe("formatEventWhen", () => {
  test("an event that never got a draft has no date", () => {
    expect(formatEventWhen({ ...base, startDate: null })).toBe("Sin fecha");
  });

  test("a single day shows the weekday and, when there is one, the hour", () => {
    expect(formatEventWhen(base)).toBe("sáb 14 mar");
    expect(formatEventWhen({ ...base, startTime: "19:30" })).toBe("sáb 14 mar · 19:30");
  });

  test("all day wins over the hour", () => {
    expect(formatEventWhen({ ...base, startTime: "19:30", allDay: true })).toBe(
      "sáb 14 mar · Todo el día",
    );
  });

  test("a range shows both ends; an end on the same day does not", () => {
    expect(formatEventWhen({ ...base, endDate: "2026-03-16", allDay: true })).toBe(
      "sáb 14 mar → lun 16 mar · Todo el día",
    );
    expect(formatEventWhen({ ...base, endDate: "2026-03-14" })).toBe("sáb 14 mar");
  });
});
