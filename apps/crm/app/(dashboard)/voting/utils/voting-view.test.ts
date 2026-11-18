import { describe, expect, test } from "bun:test";
import { seededVotings } from "../voting-config";
import {
  filterVotings,
  getOptionResults,
  getPresencePercent,
  getVotingActivity,
  summarizeVotings,
} from "./voting-view";

describe("voting view utils", () => {
  const [open] = seededVotings;

  test("computes presence and option shares", () => {
    expect(open && getPresencePercent(open)).toBe(65);
    expect(open && getOptionResults(open).map((result) => result.percent)).toEqual([67, 23, 10]);
  });

  test("summarizes the list", () => {
    const summary = summarizeVotings(seededVotings);
    expect(summary).toMatchObject({ open: 1, scheduled: 1, closed: 2, approved: 2, rejected: 0 });
  });

  test("filters by status and text", () => {
    expect(filterVotings(seededVotings, "closed", "")).toHaveLength(2);
    expect(filterVotings(seededVotings, "all", "diáconos")).toHaveLength(1);
  });

  test("builds the activity feed newest first", () => {
    const titles = open ? getVotingActivity(open).map((entry) => entry.title) : [];
    expect(titles).toEqual(["Quórum alcanzado", "Votación abierta", "Acreditación abierta"]);
  });
});
