import { describe, expect, test } from "bun:test";
import { podcasts } from "../data/podcast-seeds";
import {
  getAverageMinutes,
  getDurationMinutes,
  getSeriesNames,
  getTotalPlays,
} from "./podcast-list";

describe("podcast list helpers", () => {
  test("totals plays and lists series", () => {
    expect(getTotalPlays(podcasts)).toBe(2620);
    expect(getSeriesNames(podcasts)).toHaveLength(4);
  });

  test("parses durations and averages published episodes", () => {
    expect(getDurationMinutes("42:00")).toBe(42);
    expect(getDurationMinutes("")).toBe(0);
    expect(getAverageMinutes(podcasts)).toBe(45);
  });
});
