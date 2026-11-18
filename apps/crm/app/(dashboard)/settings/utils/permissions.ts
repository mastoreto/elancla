import {
  EMPTY_GRID,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  PERMISSION_PRESETS,
} from "../data/permission-modules";
import type {
  PermissionActionId,
  PermissionGrid,
  PermissionModuleId,
  PermissionPresetId,
} from "../types";

export const TOTAL_PERMISSIONS = PERMISSION_MODULES.length * PERMISSION_ACTIONS.length;

export function countActivePermissions(grid: PermissionGrid): number {
  return PERMISSION_MODULES.reduce((total, module) => total + grid[module.id].length, 0);
}

export function hasAction(
  grid: PermissionGrid,
  module: PermissionModuleId,
  action: PermissionActionId,
): boolean {
  return grid[module].includes(action);
}

export function isModuleFull(grid: PermissionGrid, module: PermissionModuleId): boolean {
  return grid[module].length === PERMISSION_ACTIONS.length;
}

export function toggleAction(
  grid: PermissionGrid,
  module: PermissionModuleId,
  action: PermissionActionId,
): PermissionGrid {
  const current = grid[module];
  const next = current.includes(action)
    ? current.filter((candidate) => candidate !== action)
    : PERMISSION_ACTIONS.map((candidate) => candidate.id).filter(
        (candidate) => candidate === action || current.includes(candidate),
      );
  return { ...grid, [module]: next };
}

/** "Todo" switch: grants every action, or clears the row when it already has them all. */
export function toggleModule(grid: PermissionGrid, module: PermissionModuleId): PermissionGrid {
  const next = isModuleFull(grid, module) ? [] : PERMISSION_ACTIONS.map((action) => action.id);
  return { ...grid, [module]: next };
}

function sameGrid(a: PermissionGrid, b: PermissionGrid): boolean {
  return PERMISSION_MODULES.every(({ id }) => {
    const left = [...a[id]].sort();
    const right = [...b[id]].sort();
    return left.length === right.length && left.every((value, index) => value === right[index]);
  });
}

export function applyPreset(preset: PermissionPresetId): PermissionGrid {
  const found = PERMISSION_PRESETS.find((candidate) => candidate.id === preset);
  return found ? structuredClone(found.grid) : structuredClone(EMPTY_GRID);
}

/** Preset whose permissions match the grid exactly, so its chip reads as selected. */
export function detectPreset(grid: PermissionGrid): PermissionPresetId | null {
  return PERMISSION_PRESETS.find((preset) => sameGrid(preset.grid, grid))?.id ?? null;
}
