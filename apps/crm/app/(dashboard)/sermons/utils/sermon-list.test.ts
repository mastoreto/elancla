import { describe, expect, test } from "bun:test";
import type { Sermon } from "../types";
import { describeSeries, getSeriesNames, getTotalPlays, isValidYoutubeUrl } from "./sermon-list";

const base = {
  preacher: "Ana",
  passage: "Efesios 2",
  date: "2026-11-16",
  youtubeUrl: "https://youtube.com/watch?v=abc",
} as const;

const sermons: Sermon[] = [
  { ...base, id: "1", title: "Gracia", series: "A", status: "published", plays: 10 },
  { ...base, id: "2", title: "Fe", series: "A", status: "published", plays: 5 },
  {
    ...base,
    id: "3",
    title: "Esperanza",
    series: "B",
    status: "draft",
    date: undefined,
    plays: undefined,
  },
];

describe("sermon list helpers", () => {
  test("totals plays and lists series", () => {
    expect(getTotalPlays(sermons)).toBe(15);
    expect(getSeriesNames(sermons)).toEqual(["A", "B"]);
  });

  test("prefixes only real series", () => {
    expect(describeSeries(sermons[0] as Sermon, sermons)).toBe("Serie: A");
    expect(describeSeries(sermons[2] as Sermon, sermons)).toBe("B");
  });

  test("accepts only youtube links", () => {
    expect(isValidYoutubeUrl("https://youtube.com/watch?v=abc")).toBe(true);
    expect(isValidYoutubeUrl("https://example.com/x")).toBe(false);
    expect(isValidYoutubeUrl("no es un link")).toBe(false);
  });
});
