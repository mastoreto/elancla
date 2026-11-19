import {
  type PermissionGrant,
  SCOPE_BREADTH,
  toPermission,
} from "@ancla/contracts";
import type { Access } from "../../context";

/**
 * Whether `access` already holds every grant in `needed` with an equal or wider scope
 * (`all` > `ministry` > `own`). An admin covers everything. Used so nobody hands out more than
 * they hold.
 */
export function coversGrants(
  access: Pick<Access, "isAdmin" | "grants">,
  needed: readonly PermissionGrant[],
): boolean {
  if (access.isAdmin) return true;
  return needed.every(({ resource, action, scope }) => {
    const held = access.grants.get(toPermission(resource, action));
    return held !== undefined && SCOPE_BREADTH[held] >= SCOPE_BREADTH[scope];
  });
}
