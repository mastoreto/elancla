import { describe, expect, test } from "bun:test";
import {
  type ReminderState,
  reminderTargetYear,
  shouldRemind,
} from "./shouldRemind";

const OPEN: ReminderState = {
  targetYearPublished: false,
  pendingReviews: 0,
  lastSentOn: null,
};

describe("shouldRemind", () => {
  test.each([
    ["2026-11-30", false],
    ["2026-12-01", true],
    ["2026-12-02", false],
    ["2026-12-03", true],
    ["2026-12-05", true],
    ["2026-12-30", false],
    ["2026-12-31", true],
  ])("the year is not published: %s -> %p", (date, expected) => {
    expect(shouldRemind(date, OPEN)).toBe(expected);
  });

  test("it goes on in January keeping the every-second-day rhythm", () => {
    // January 1st is 31 days after December 1st (odd), so January 2nd is the next one.
    expect(shouldRemind("2027-01-01", OPEN)).toBe(false);
    expect(shouldRemind("2027-01-02", OPEN)).toBe(true);
    expect(shouldRemind("2027-01-03", OPEN)).toBe(false);
    expect(shouldRemind("2027-01-04", OPEN)).toBe(true);
  });

  test("the other months have no reminders", () => {
    expect(shouldRemind("2027-02-02", OPEN)).toBe(false);
    expect(shouldRemind("2027-06-15", OPEN)).toBe(false);
  });

  test("it stops when the year is published and every review is confirmed", () => {
    const done = { ...OPEN, targetYearPublished: true };
    expect(shouldRemind("2026-12-01", done)).toBe(false);
  });

  test("a published year with a review left still reminds", () => {
    const state = { ...OPEN, targetYearPublished: true, pendingReviews: 1 };
    expect(shouldRemind("2026-12-01", state)).toBe(true);
  });

  test("an unpublished year with every review confirmed still reminds", () => {
    expect(shouldRemind("2026-12-01", { ...OPEN, pendingReviews: 0 })).toBe(
      true,
    );
  });

  test("it does not send twice on the same local day", () => {
    expect(
      shouldRemind("2026-12-03", { ...OPEN, lastSentOn: "2026-12-03" }),
    ).toBe(false);
    expect(
      shouldRemind("2026-12-03", { ...OPEN, lastSentOn: "2026-12-01" }),
    ).toBe(true);
  });
});

describe("reminderTargetYear", () => {
  test("December targets the next year, January the current one, the rest none", () => {
    expect(reminderTargetYear("2026-12-01")).toBe(2027);
    expect(reminderTargetYear("2027-01-10")).toBe(2027);
    expect(reminderTargetYear("2027-03-10")).toBeNull();
  });
});
