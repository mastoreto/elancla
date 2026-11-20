import { describe, expect, test } from "bun:test";
import { parseServiceTimes } from "./parseServiceTimes";

const WORSHIP = { kind: "worship", weekday: 0, start: "11:15", end: "13:00" };

describe("parseServiceTimes", () => {
  test("keeps valid slots", () => {
    expect(parseServiceTimes([WORSHIP])).toEqual([WORSHIP]);
  });

  test("drops malformed slots and keeps the valid ones", () => {
    const backwards = { ...WORSHIP, start: "13:00", end: "11:15" };
    expect(parseServiceTimes([WORSHIP, backwards, { kind: "x" }, 3])).toEqual([
      WORSHIP,
    ]);
  });

  test("anything that is not the expected shape is empty or all active", () => {
    for (const stored of [null, undefined, {}, "text"]) {
      expect(parseServiceTimes(stored)).toEqual([]);
    }
  });
});
