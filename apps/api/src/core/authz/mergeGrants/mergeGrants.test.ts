import { describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { mergeGrants } from "./mergeGrants";

describe("mergeGrants", () => {
  test("is the union of every role", () => {
    const merged = mergeGrants([
      [grant(PERMISSIONS.movements.view, "all")],
      [grant(PERMISSIONS.requests.create, "own")],
    ]);
    expect([...merged.keys()].sort()).toEqual([
      PERMISSIONS.movements.view,
      PERMISSIONS.requests.create,
    ]);
  });

  test("the widest scope wins for the same permission", () => {
    const merged = mergeGrants([
      [grant(PERMISSIONS.requests.view, "own")],
      [grant(PERMISSIONS.requests.view, "all")],
      [grant(PERMISSIONS.requests.view, "ministry")],
    ]);
    expect(merged.get(PERMISSIONS.requests.view)).toBe("all");
  });

  test("no roles grant nothing", () => {
    expect(mergeGrants([]).size).toBe(0);
  });
});
