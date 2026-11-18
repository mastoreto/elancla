import { describe, expect, test } from "bun:test";
import { NEW_ROLE_GRID, OPERATIONAL_GRID } from "../data/permission-modules";
import {
  applyPreset,
  countActivePermissions,
  detectPreset,
  isModuleFull,
  toggleAction,
  toggleModule,
} from "./permissions";

describe("permissions", () => {
  test("counts the active permissions", () => {
    expect(countActivePermissions(NEW_ROLE_GRID)).toBe(2);
    expect(countActivePermissions(OPERATIONAL_GRID)).toBe(15);
    expect(countActivePermissions(applyPreset("full"))).toBe(45);
  });

  test("toggles a single action without mutating the grid", () => {
    const next = toggleAction(NEW_ROLE_GRID, "movements", "create");
    expect(next.movements).toEqual(["view", "create"]);
    expect(NEW_ROLE_GRID.movements).toEqual(["view"]);
    expect(toggleAction(next, "movements", "view").movements).toEqual(["create"]);
  });

  test("the row switch grants everything, then clears it", () => {
    const full = toggleModule(NEW_ROLE_GRID, "settings");
    expect(isModuleFull(full, "settings")).toBe(true);
    expect(toggleModule(full, "settings").settings).toEqual([]);
  });

  test("detects the preset that matches the grid", () => {
    expect(detectPreset(OPERATIONAL_GRID)).toBe("operational");
    expect(detectPreset(NEW_ROLE_GRID)).toBeNull();
  });
});
