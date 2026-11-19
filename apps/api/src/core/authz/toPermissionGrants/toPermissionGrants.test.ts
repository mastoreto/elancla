import { describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { toPermissionGrants } from "./toPermissionGrants";

describe("toPermissionGrants", () => {
  test("keeps valid rows and drops what the catalog does not support", () => {
    const grants = toPermissionGrants([
      grant(PERMISSIONS.movements.view, "all"),
      { resource: "removed-module", action: "view", scope: "all" },
      { resource: "users", action: "view", scope: "own" },
    ]);
    expect(grants).toEqual([grant(PERMISSIONS.movements.view, "all")]);
  });
});
