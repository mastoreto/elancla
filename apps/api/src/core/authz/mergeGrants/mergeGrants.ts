import {
  type Permission,
  type PermissionGrant,
  type PermissionScope,
  toPermission,
  widerScope,
} from "@ancla/contracts";

/** Union of the grids of every role; for the same permission the widest scope wins. */
export function mergeGrants(
  grids: readonly (readonly PermissionGrant[])[],
): Map<Permission, PermissionScope> {
  const merged = new Map<Permission, PermissionScope>();
  for (const grid of grids) {
    for (const { resource, action, scope } of grid) {
      const permission = toPermission(resource, action);
      const current = merged.get(permission);
      merged.set(permission, current ? widerScope(current, scope) : scope);
    }
  }
  return merged;
}
