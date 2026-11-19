import { describe, expect, test } from "bun:test";
import { mergeGrants } from "./mergeGrants";

describe("mergeGrants", () => {
  test("is the union of every role", () => {
    const merged = mergeGrants([
      [{ resource: "movements", action: "view", scope: "all" }],
      [{ resource: "requests", action: "create", scope: "own" }],
    ]);
    expect([...merged.keys()].sort()).toEqual([
      "movements:view",
      "requests:create",
    ]);
  });

  test("the widest scope wins for the same permission", () => {
    const merged = mergeGrants([
      [{ resource: "requests", action: "view", scope: "own" }],
      [{ resource: "requests", action: "view", scope: "all" }],
      [{ resource: "requests", action: "view", scope: "ministry" }],
    ]);
    expect(merged.get("requests:view")).toBe("all");
  });

  test("no roles grant nothing", () => {
    expect(mergeGrants([]).size).toBe(0);
  });
});
