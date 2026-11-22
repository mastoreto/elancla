import { describe, expect, test } from "bun:test";
import { describeValidity, formatCalendarDate } from "./describeValidity";

describe("describeValidity", () => {
  test("formats a calendar date day first", () => {
    expect(formatCalendarDate("2026-03-05")).toBe("05/03/2026");
    expect(formatCalendarDate("nope")).toBe("nope");
  });

  test("describes every combination of the window", () => {
    expect(describeValidity("2026-12-01", "2027-01-15")).toBe("Del 01/12/2026 al 15/01/2027");
    expect(describeValidity("2026-12-01", null)).toBe("Desde el 01/12/2026");
    expect(describeValidity(null, "2027-01-15")).toBe("Hasta el 15/01/2027");
    expect(describeValidity(null, null)).toBe("Sin vigencia");
  });
});
