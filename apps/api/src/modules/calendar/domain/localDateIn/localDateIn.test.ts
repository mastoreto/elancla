import { describe, expect, test } from "bun:test";
import { localDateIn } from "./localDateIn";

const MONTEVIDEO = "America/Montevideo";

describe("localDateIn", () => {
  test("is the day before in Montevideo while UTC has already turned the page", () => {
    // 01:30 UTC on the 2nd is 22:30 (UTC-3) on the 1st in Montevideo.
    const now = new Date("2027-01-02T01:30:00Z");
    expect(localDateIn("UTC", now)).toBe("2027-01-02");
    expect(localDateIn(MONTEVIDEO, now)).toBe("2027-01-01");
  });

  test("turns the page exactly at local midnight", () => {
    expect(localDateIn(MONTEVIDEO, new Date("2027-01-02T02:59:59Z"))).toBe(
      "2027-01-01",
    );
    expect(localDateIn(MONTEVIDEO, new Date("2027-01-02T03:00:00Z"))).toBe(
      "2027-01-02",
    );
  });

  test("works for a zone ahead of UTC", () => {
    const now = new Date("2027-12-31T20:00:00Z");
    expect(localDateIn("Asia/Tokyo", now)).toBe("2028-01-01");
  });
});
