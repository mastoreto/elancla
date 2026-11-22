import { describe, expect, test } from "bun:test";
import { selectCopyItems } from "./selectCopyItems";

const activities = [
  { id: "a1", isFixed: false, year: 2026 },
  { id: "a2", isFixed: false, year: 2026 },
  { id: "a3", isFixed: false, year: 2025 },
  { id: "fixed", isFixed: true, year: null },
];
const events = [
  { id: "e1", year: 2026 },
  { id: "e2", year: 2026 },
  { id: "e3", year: 2025 },
];

const select = (activityIds: string[], eventIds: string[]) =>
  selectCopyItems({
    fromYear: 2026,
    activityIds,
    eventIds,
    activities,
    events,
  });

describe("selectCopyItems", () => {
  test("returns exactly what was selected", () => {
    const picked = select(["a2"], ["e1"]);
    expect(picked.activities.map(({ id }) => id)).toEqual(["a2"]);
    expect(picked.events.map(({ id }) => id)).toEqual(["e1"]);
    expect(picked.rejectedIds).toEqual([]);
  });

  test("what was not selected is not copied", () => {
    const picked = select([], ["e2"]);
    expect(picked.activities).toEqual([]);
    expect(picked.events.map(({ id }) => id)).toEqual(["e2"]);
  });

  test("rejects ids of another year, fixed activities and unknown ids", () => {
    const picked = select(["a3", "fixed", "nope"], ["e3"]);
    expect(picked.activities).toEqual([]);
    expect(picked.events).toEqual([]);
    expect(picked.rejectedIds.sort()).toEqual(["a3", "e3", "fixed", "nope"]);
  });

  test("an event id in the activity list is rejected, not copied", () => {
    expect(select(["e1"], []).rejectedIds).toEqual(["e1"]);
  });

  test("a repeated id copies once", () => {
    expect(select(["a1", "a1"], []).activities).toHaveLength(1);
  });
});
