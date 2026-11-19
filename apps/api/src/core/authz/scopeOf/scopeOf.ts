import type { Permission, PermissionScope } from "@ancla/contracts";
import type { Access } from "../../context";

/** The scope an access has on a permission, or `null` when it has none. Admin is always `all`. */
export function scopeOf(
  access: Access,
  permission: Permission,
): PermissionScope | null {
  if (access.isAdmin) return "all";
  return access.grants.get(permission) ?? null;
}
