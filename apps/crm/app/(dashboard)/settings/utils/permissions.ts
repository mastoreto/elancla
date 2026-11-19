import {
  actionsOf,
  PERMISSION_RESOURCES,
  PERMISSIONS,
  type Permission,
  type PermissionAction,
  type PermissionGrant,
  type PermissionResource,
  type PermissionScope,
  SCOPE_BREADTH,
  scopesOf,
  toPermission,
} from "@ancla/contracts";
import type { PermissionGrid, PermissionPresetId } from "../types";

export const TOTAL_PERMISSIONS = PERMISSION_RESOURCES.reduce(
  (total, resource) => total + actionsOf(resource).length,
  0,
);

export const EMPTY_GRID: PermissionGrid = {};

/** Starting point for a new role: it can see movements and reports. */
export const NEW_ROLE_GRID: PermissionGrid = {
  [PERMISSIONS.movements.view]: "all",
  [PERMISSIONS.reports.view]: "all",
};

const byBreadth = (left: PermissionScope, right: PermissionScope) =>
  SCOPE_BREADTH[left] - SCOPE_BREADTH[right];

/** Least privilege: a newly checked cell starts with the narrowest scope its resource supports. */
export function narrowestScope(resource: PermissionResource): PermissionScope {
  return [...scopesOf(resource)].sort(byBreadth)[0] as PermissionScope;
}

export function widestScope(resource: PermissionResource): PermissionScope {
  return [...scopesOf(resource)].sort(byBreadth).at(-1) as PermissionScope;
}

export function toGrid(grants: readonly PermissionGrant[]): PermissionGrid {
  const grid: PermissionGrid = {};
  for (const { resource, action, scope } of grants) {
    grid[toPermission(resource, action)] = scope;
  }
  return grid;
}

/** The grid as the API receives it, in catalog order. */
export function toGrants(grid: PermissionGrid): PermissionGrant[] {
  return PERMISSION_RESOURCES.flatMap((resource) =>
    actionsOf(resource).flatMap((action) => {
      const scope = grid[toPermission(resource, action)];
      return scope ? [{ resource, action, scope }] : [];
    }),
  );
}

export function countActivePermissions(grid: PermissionGrid): number {
  return toGrants(grid).length;
}

export function scopeOfCell(
  grid: PermissionGrid,
  resource: PermissionResource,
  action: PermissionAction,
): PermissionScope | undefined {
  return grid[toPermission(resource, action)];
}

export function isResourceFull(grid: PermissionGrid, resource: PermissionResource): boolean {
  return actionsOf(resource).every((action) => scopeOfCell(grid, resource, action) !== undefined);
}

function withCell(
  grid: PermissionGrid,
  permission: Permission,
  scope: PermissionScope | undefined,
): PermissionGrid {
  const { [permission]: _removed, ...rest } = grid;
  return scope ? { ...rest, [permission]: scope } : rest;
}

export function toggleAction(
  grid: PermissionGrid,
  resource: PermissionResource,
  action: PermissionAction,
): PermissionGrid {
  const permission = toPermission(resource, action);
  return withCell(grid, permission, grid[permission] ? undefined : narrowestScope(resource));
}

/** Picks the scope of one granted cell. Scopes the resource does not support are ignored. */
export function setScope(
  grid: PermissionGrid,
  resource: PermissionResource,
  action: PermissionAction,
  scope: PermissionScope,
): PermissionGrid {
  const permission = toPermission(resource, action);
  if (!(grid[permission] && scopesOf(resource).includes(scope))) return grid;
  return withCell(grid, permission, scope);
}

/** "Todo" switch: grants every action of the resource (widest scope), or clears the row. */
export function toggleResource(grid: PermissionGrid, resource: PermissionResource): PermissionGrid {
  const permissions = actionsOf(resource).map((action) => toPermission(resource, action));
  if (isResourceFull(grid, resource)) {
    return permissions.reduce((next, permission) => withCell(next, permission, undefined), grid);
  }
  return permissions.reduce(
    (next, permission) =>
      next[permission] ? next : withCell(next, permission, widestScope(resource)),
    grid,
  );
}

const OPERATIONAL_RESOURCES: Partial<Record<PermissionResource, PermissionAction[]>> = {
  movements: ["view", "create", "edit"],
  requests: ["view", "create", "edit", "approve"],
  vouchers: ["view", "create", "edit"],
  projects: ["view"],
  budgets: ["view"],
  voting: ["view"],
  reports: ["view", "create"],
};

/** Resources that manage the system itself: a read-only profile does not include them. */
const SYSTEM_RESOURCES: readonly PermissionResource[] = [
  "users",
  "roles",
  "invitations",
  "site.keys",
  "settings",
];

function buildPreset(id: PermissionPresetId): PermissionGrid {
  const grid: PermissionGrid = {};
  for (const resource of PERMISSION_RESOURCES) {
    const actions =
      id === "operational"
        ? (OPERATIONAL_RESOURCES[resource] ?? [])
        : id === "readonly"
          ? SYSTEM_RESOURCES.includes(resource)
            ? []
            : (["view"] as PermissionAction[])
          : actionsOf(resource);
    for (const action of actions) {
      grid[toPermission(resource, action)] = widestScope(resource);
    }
  }
  return grid;
}

export const PERMISSION_PRESETS: { id: PermissionPresetId; label: string; grid: PermissionGrid }[] =
  [
    { id: "readonly", label: "Solo lectura", grid: buildPreset("readonly") },
    { id: "operational", label: "Operativo", grid: buildPreset("operational") },
    { id: "full", label: "Completo", grid: buildPreset("full") },
  ];

export function applyPreset(preset: PermissionPresetId): PermissionGrid {
  const found = PERMISSION_PRESETS.find((candidate) => candidate.id === preset);
  return found ? { ...found.grid } : { ...EMPTY_GRID };
}

function sameGrid(left: PermissionGrid, right: PermissionGrid): boolean {
  const leftCells = Object.entries(left).sort();
  const rightCells = Object.entries(right).sort();
  return (
    leftCells.length === rightCells.length &&
    leftCells.every(
      ([key, scope], index) => rightCells[index]?.[0] === key && rightCells[index]?.[1] === scope,
    )
  );
}

/** Preset whose cells match the grid exactly, so its chip reads as selected. */
export function detectPreset(grid: PermissionGrid): PermissionPresetId | null {
  return PERMISSION_PRESETS.find((preset) => sameGrid(preset.grid, grid))?.id ?? null;
}
