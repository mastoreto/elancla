import { describe, expect, test } from "bun:test";
import { issueNumbers } from "./issueNumbers";

describe("issueNumbers", () => {
  test("numbers from the oldest first publication", () => {
    const numbers = issueNumbers([
      { id: "b", firstLiveAt: new Date("2026-02-01T00:00:00Z") },
      { id: "a", firstLiveAt: new Date("2026-01-01T00:00:00Z") },
      { id: "c", firstLiveAt: new Date("2026-03-01T00:00:00Z") },
    ]);
    expect([numbers.get("a"), numbers.get("b"), numbers.get("c")]).toEqual([
      1, 2, 3,
    ]);
  });

  test("ties are broken by id", () => {
    const at = new Date("2026-01-01T00:00:00Z");
    const numbers = issueNumbers([
      { id: "z", firstLiveAt: at },
      { id: "m", firstLiveAt: at },
    ]);
    expect(numbers.get("m")).toBe(1);
    expect(numbers.get("z")).toBe(2);
  });

  test("no posts, no numbers", () => {
    expect(issueNumbers([]).size).toBe(0);
  });
});
