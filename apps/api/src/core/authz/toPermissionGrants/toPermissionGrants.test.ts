import { describe, expect, test } from "bun:test";
import { toPermissionGrants } from "./toPermissionGrants";

describe("toPermissionGrants", () => {
  test("keeps valid rows and drops what the catalog does not support", () => {
    const grants = toPermissionGrants([
      { resource: "movements", action: "view", scope: "all" },
      { resource: "removed-module", action: "view", scope: "all" },
      { resource: "users", action: "view", scope: "own" },
    ]);
    expect(grants).toEqual([
      { resource: "movements", action: "view", scope: "all" },
    ]);
  });
});
