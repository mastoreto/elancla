import { describe, expect, test } from "bun:test";
import { seriesState } from "./seriesState";

describe("seriesState", () => {
  test("the post being read is current", () => {
    expect(seriesState({ postId: "a", visible: true }, "a")).toBe("current");
  });

  test("a visible post is published", () => {
    expect(seriesState({ postId: "a", visible: true }, "b")).toBe("published");
    expect(seriesState({ postId: "a", visible: true })).toBe("published");
  });

  test("a scheduled post is next", () => {
    expect(seriesState({ postId: "a", visible: false }, "b")).toBe("next");
  });
});
