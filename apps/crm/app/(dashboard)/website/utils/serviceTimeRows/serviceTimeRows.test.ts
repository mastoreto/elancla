import { describe, expect, test } from "bun:test";
import { findRowError, newRow, toRows, toServiceTimes } from "./serviceTimeRows";

describe("serviceTimeRows", () => {
  test("round-trips the slots, mapping a missing end to null", () => {
    const slots = [
      { kind: "worship", weekday: 0, start: "11:15", end: "13:00" },
      { kind: "bibleSchool", weekday: 0, start: "10:00", end: null },
    ] as const;
    expect(toServiceTimes(toRows(slots))).toEqual([...slots]);
  });

  test("every row gets its own id", () => {
    const [first, second] = [newRow(), newRow()];
    expect(first.id).not.toBe(second.id);
  });

  test("flags a missing start and an end that is not after it", () => {
    const row = newRow();
    expect(findRowError({ ...row, start: "" })).not.toBeNull();
    expect(findRowError({ ...row, start: "11:00", end: "11:00" })).not.toBeNull();
    expect(findRowError({ ...row, start: "11:00", end: "12:00" })).toBeNull();
    expect(findRowError({ ...row, start: "11:00", end: "" })).toBeNull();
  });
});
