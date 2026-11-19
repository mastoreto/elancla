import { describe, expect, test } from "bun:test";
import { actionsOf, PERMISSION_RESOURCES, PERMISSIONS, scopesOf } from "@ancla/contracts";
import {
  applyPreset,
  countActivePermissions,
  detectPreset,
  isResourceFull,
  NEW_ROLE_GRID,
  setScope,
  TOTAL_PERMISSIONS,
  toGrants,
  toGrid,
  toggleAction,
  toggleResource,
} from "./permissions";

describe("permissions", () => {
  test("the total follows the catalog", () => {
    const expected = PERMISSION_RESOURCES.reduce((sum, r) => sum + actionsOf(r).length, 0);
    expect(TOTAL_PERMISSIONS).toBe(expected);
    expect(countActivePermissions(applyPreset("full"))).toBe(TOTAL_PERMISSIONS);
    expect(countActivePermissions(NEW_ROLE_GRID)).toBe(2);
  });

  test("a newly checked cell takes the narrowest scope its resource supports", () => {
    expect(toggleAction({}, "requests", "view")[PERMISSIONS.requests.view]).toBe("own");
    expect(toggleAction({}, "budgets", "view")[PERMISSIONS.budgets.view]).toBe("ministry");
    expect(toggleAction({}, "movements", "view")[PERMISSIONS.movements.view]).toBe("all");
  });

  test("toggling twice clears the cell and never mutates the grid", () => {
    const next = toggleAction(NEW_ROLE_GRID, "movements", "create");
    expect(next[PERMISSIONS.movements.create]).toBe("all");
    expect(NEW_ROLE_GRID[PERMISSIONS.movements.create]).toBeUndefined();
    expect(toggleAction(next, "movements", "view")[PERMISSIONS.movements.view]).toBeUndefined();
  });

  test("each cell has its own scope, limited to what the resource supports", () => {
    const grid = setScope(
      toggleAction(toggleAction({}, "requests", "view"), "requests", "create"),
      "requests",
      "view",
      "ministry",
    );
    expect(grid[PERMISSIONS.requests.view]).toBe("ministry");
    expect(grid[PERMISSIONS.requests.create]).toBe("own");
    // Users are global: a ministry scope is ignored.
    const users = toggleAction({}, "users", "view");
    expect(setScope(users, "users", "view", "ministry")[PERMISSIONS.users.view]).toBe("all");
    expect(scopesOf("users")).toEqual(["all"]);
  });

  test("the row switch grants every action with the widest scope, then clears it", () => {
    const full = toggleResource(NEW_ROLE_GRID, "requests");
    expect(isResourceFull(full, "requests")).toBe(true);
    expect(full[PERMISSIONS.requests.approve]).toBe("all");
    expect(isResourceFull(toggleResource(full, "requests"), "requests")).toBe(false);
  });

  test("grants round-trip through the grid", () => {
    const grants = toGrants(applyPreset("operational"));
    expect(toGrid(grants)).toEqual(applyPreset("operational"));
  });

  test("detects the preset that matches the grid", () => {
    expect(detectPreset(applyPreset("operational"))).toBe("operational");
    expect(detectPreset(applyPreset("readonly"))).toBe("readonly");
    expect(detectPreset(NEW_ROLE_GRID)).toBeNull();
  });

  test("the read-only preset leaves out the system resources", () => {
    const readonly = applyPreset("readonly");
    expect(readonly[PERMISSIONS.movements.view]).toBe("all");
    expect(readonly[PERMISSIONS.roles.view]).toBeUndefined();
  });
});
