import { describe, expect, test } from "bun:test";
import { pickRelated, type RelatedCandidate } from "./pickRelated";

const day = (n: number) => new Date(Date.UTC(2026, 0, n));
const post = (
  id: string,
  overrides: Partial<RelatedCandidate> = {},
): RelatedCandidate => ({
  id,
  seriesId: null,
  categoryId: "c-other",
  tags: [],
  displayedAt: day(1),
  ...overrides,
});
const current = {
  ...post("me", { seriesId: "s1", categoryId: "c1", tags: ["fe", "gracia"] }),
  relatedPostIds: [] as string[],
};

describe("pickRelated", () => {
  test("manual relations come first, in the author's order, if visible", () => {
    const ids = pickRelated({
      current: { ...current, relatedPostIds: ["z", "gone", "a"] },
      candidates: [post("a"), post("z"), post("b", { seriesId: "s1" })],
    });
    expect(ids).toEqual(["z", "a", "b"]);
  });

  test("completes by series, then category, then shared tags, then recency", () => {
    const ids = pickRelated({
      current,
      candidates: [
        post("recent", { displayedAt: day(20) }),
        post("tags", { tags: ["fe", "gracia"] }),
        post("category", { categoryId: "c1" }),
        post("series", { seriesId: "s1" }),
      ],
    });
    expect(ids).toEqual(["series", "category", "tags"]);
  });

  test("breaks the last ties by most recent", () => {
    const ids = pickRelated({
      current,
      candidates: [
        post("old", { displayedAt: day(2) }),
        post("new", { displayedAt: day(9) }),
      ],
    });
    expect(ids).toEqual(["new", "old"]);
  });

  test("never includes the post itself nor more than the limit", () => {
    const ids = pickRelated({
      current,
      candidates: [post("me"), post("a"), post("b"), post("c"), post("d")],
    });
    expect(ids).toHaveLength(3);
    expect(ids).not.toContain("me");
  });
});
