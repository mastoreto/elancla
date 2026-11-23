import { describe, expect, test } from "bun:test";
import { SERMON_SERIES_ORDER_MAX } from "@ancla/contracts";
import { assignSeriesPlaylists } from "./assignSeriesPlaylists";

describe("assignSeriesPlaylists", () => {
  test("numbers the new sermons in playlist order and ignores the ones not being imported", () => {
    const placements = assignSeriesPlaylists(
      new Set(["a", "c"]),
      [{ playlistId: "PL1", videoIds: ["a", "b", "c"] }],
      new Map(),
    );
    expect([...placements]).toEqual([
      ["a", { playlistId: "PL1", order: 1 }],
      ["c", { playlistId: "PL1", order: 2 }],
    ]);
  });

  test("starts after the sermons the series already has", () => {
    const placements = assignSeriesPlaylists(
      new Set(["a"]),
      [{ playlistId: "PL1", videoIds: ["a"] }],
      new Map([["PL1", 5]]),
    );
    expect(placements.get("a")).toEqual({ playlistId: "PL1", order: 5 });
  });

  test("a video in several playlists keeps the first one", () => {
    const placements = assignSeriesPlaylists(
      new Set(["a", "b"]),
      [
        { playlistId: "PL1", videoIds: ["a"] },
        { playlistId: "PL2", videoIds: ["a", "b"] },
      ],
      new Map(),
    );
    expect(placements.get("a")).toEqual({ playlistId: "PL1", order: 1 });
    expect(placements.get("b")).toEqual({ playlistId: "PL2", order: 1 });
  });

  test("never goes past the maximum position", () => {
    const placements = assignSeriesPlaylists(
      new Set(["a", "b"]),
      [{ playlistId: "PL1", videoIds: ["a", "b"] }],
      new Map([["PL1", SERMON_SERIES_ORDER_MAX]]),
    );
    expect(placements.get("b")?.order).toBe(SERMON_SERIES_ORDER_MAX);
  });
});
