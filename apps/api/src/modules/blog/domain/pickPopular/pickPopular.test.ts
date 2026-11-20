import { describe, expect, test } from "bun:test";
import { pickPopular } from "./pickPopular";

const post = (postId: string, day: number) => ({
  postId,
  displayedAt: new Date(Date.UTC(2026, 0, day)),
});

describe("pickPopular", () => {
  test("orders by views, then most recent, and drops unread posts", () => {
    const visible = [post("a", 1), post("b", 2), post("c", 3), post("d", 4)];
    const views = new Map([
      ["a", 10],
      ["b", 10],
      ["c", 3],
    ]);
    expect(pickPopular(visible, views)).toEqual(["b", "a", "c"]);
  });

  test("keeps only the top of the list", () => {
    const visible = [post("a", 1), post("b", 2), post("c", 3)];
    const views = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    expect(pickPopular(visible, views, 2)).toEqual(["c", "b"]);
  });
});
