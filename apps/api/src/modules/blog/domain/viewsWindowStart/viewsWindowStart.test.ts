import { describe, expect, test } from "bun:test";
import { viewsWindowStart } from "./viewsWindowStart";

describe("viewsWindowStart", () => {
  test("a window of 30 days that includes today", () => {
    expect(viewsWindowStart(new Date("2026-05-30T12:00:00Z"), "UTC")).toEqual(
      new Date("2026-05-01T00:00:00Z"),
    );
  });

  test("today is the one of the organization time zone", () => {
    // 01:00 UTC on May 30 is still May 29 in Buenos Aires.
    expect(
      viewsWindowStart(
        new Date("2026-05-30T01:00:00Z"),
        "America/Argentina/Buenos_Aires",
      ),
    ).toEqual(new Date("2026-04-30T00:00:00Z"));
  });
});
