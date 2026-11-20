import { describe, expect, test } from "bun:test";
import { nextFirstLiveAt } from "./fixFirstLiveAt";

const now = new Date("2026-05-01T12:00:00Z");

describe("nextFirstLiveAt", () => {
  test("the first time it is publishAt, or now without it", () => {
    expect(
      nextFirstLiveAt({ current: null, publishAt: undefined, now }),
    ).toEqual(now);
    expect(
      nextFirstLiveAt({
        current: null,
        publishAt: "2026-06-01T12:00:00Z",
        now,
      }),
    ).toEqual(new Date("2026-06-01T12:00:00Z"));
  });

  test("once it was visible it never moves", () => {
    expect(
      nextFirstLiveAt({
        current: new Date("2026-04-01T00:00:00Z"),
        publishAt: "2026-09-01T00:00:00Z",
        now,
      }),
    ).toBeNull();
    expect(
      nextFirstLiveAt({ current: now, publishAt: undefined, now }),
    ).toBeNull();
  });

  test("a date that has not arrived yet (never visible) is replaced", () => {
    expect(
      nextFirstLiveAt({
        current: new Date("2026-06-01T00:00:00Z"),
        publishAt: "2026-07-01T00:00:00Z",
        now,
      }),
    ).toEqual(new Date("2026-07-01T00:00:00Z"));
    expect(
      nextFirstLiveAt({
        current: new Date("2026-06-01T00:00:00Z"),
        publishAt: undefined,
        now,
      }),
    ).toEqual(now);
  });
});
