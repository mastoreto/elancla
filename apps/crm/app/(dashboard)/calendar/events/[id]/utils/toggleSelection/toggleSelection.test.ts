import { describe, expect, test } from "bun:test";
import { toggleSelection } from "./toggleSelection";

describe("toggleSelection", () => {
  test("adds an id that was not selected, at the end", () => {
    expect(toggleSelection(["a"], "b")).toEqual(["a", "b"]);
  });

  test("removes an id that was selected", () => {
    expect(toggleSelection(["a", "b"], "a")).toEqual(["b"]);
  });

  test("does not add past the maximum", () => {
    expect(toggleSelection(["a", "b"], "c", 2)).toEqual(["a", "b"]);
  });

  test("still removes when the maximum is reached", () => {
    expect(toggleSelection(["a", "b"], "b", 2)).toEqual(["a"]);
  });

  test("never mutates its input", () => {
    const ids = ["a"];
    toggleSelection(ids, "b");
    expect(ids).toEqual(["a"]);
  });
});
