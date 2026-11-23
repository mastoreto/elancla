import { describe, expect, test } from "bun:test";
import { nextSermonFirstLiveAt } from "./fixSermonFirstLiveAt";

const NOW = new Date("2026-05-10T12:00:00Z");

describe("nextSermonFirstLiveAt", () => {
  test("the first time live it is now", () => {
    expect(nextSermonFirstLiveAt(null, NOW)).toEqual(NOW);
  });

  test("once set it never moves", () => {
    expect(nextSermonFirstLiveAt(new Date("2026-01-01T00:00:00Z"), NOW)).toBe(
      null,
    );
  });
});
