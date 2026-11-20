import { describe, expect, test } from "bun:test";
import { urlDate } from "./urlDate";

describe("urlDate", () => {
  test("uses the day of the time zone, not the UTC one", () => {
    const instant = new Date("2026-03-10T02:30:00Z");
    expect(urlDate(instant, "UTC")).toBe("2026-03-10");
    expect(urlDate(instant, "America/Argentina/Buenos_Aires")).toBe(
      "2026-03-09",
    );
  });

  test("zero-pads month and day", () => {
    expect(urlDate(new Date("2026-01-05T12:00:00Z"), "UTC")).toBe("2026-01-05");
  });
});
