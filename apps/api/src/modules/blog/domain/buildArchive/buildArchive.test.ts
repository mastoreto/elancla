import { describe, expect, test } from "bun:test";
import { buildArchive } from "./buildArchive";

describe("buildArchive", () => {
  test("groups by year and month, newest first", () => {
    const archive = buildArchive(
      [
        new Date("2026-01-10T12:00:00Z"),
        new Date("2026-03-01T12:00:00Z"),
        new Date("2026-01-20T12:00:00Z"),
        new Date("2025-12-31T12:00:00Z"),
      ],
      "UTC",
    );
    expect(archive).toEqual([
      { year: 2026, month: 3, count: 1 },
      { year: 2026, month: 1, count: 2 },
      { year: 2025, month: 12, count: 1 },
    ]);
  });

  test("the month is the one of the organization time zone", () => {
    const archive = buildArchive(
      [new Date("2026-02-01T01:00:00Z")],
      "America/Argentina/Buenos_Aires",
    );
    expect(archive).toEqual([{ year: 2026, month: 1, count: 1 }]);
  });

  test("no posts, no archive", () => {
    expect(buildArchive([], "UTC")).toEqual([]);
  });
});
