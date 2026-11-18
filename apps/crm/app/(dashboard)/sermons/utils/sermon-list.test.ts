import { describe, expect, test } from "bun:test";
import type { Sermon } from "../types";
import { countByStatus, filterSermons, getTotalPlays, isValidYoutubeUrl } from "./sermon-list";

const sermons: Sermon[] = [
  {
    id: "1",
    title: "Gracia",
    preacher: "Ana",
    passage: "Efesios 2",
    series: "A",
    status: "published",
    date: "2026-11-16",
    plays: 10,
  },
  {
    id: "2",
    title: "Esperanza",
    preacher: "Luis",
    passage: "Isaías 40",
    series: "B",
    status: "draft",
    date: undefined,
    plays: undefined,
  },
];

describe("sermon list helpers", () => {
  test("filters by status and text", () => {
    expect(filterSermons(sermons, "", "draft").map((s) => s.id)).toEqual(["2"]);
    expect(filterSermons(sermons, "efesios", "all").map((s) => s.id)).toEqual(["1"]);
  });

  test("counts statuses and totals plays", () => {
    expect(countByStatus(sermons)).toEqual({ all: 2, published: 1, draft: 1 });
    expect(getTotalPlays(sermons)).toBe(10);
  });

  test("accepts only youtube links", () => {
    expect(isValidYoutubeUrl("https://youtube.com/watch?v=abc")).toBe(true);
    expect(isValidYoutubeUrl("https://example.com/x")).toBe(false);
    expect(isValidYoutubeUrl("no es un link")).toBe(false);
  });
});
