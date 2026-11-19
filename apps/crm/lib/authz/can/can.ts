import type { MePermissionsDto, Permission } from "@ancla/contracts";

/** The slice of `/me/permissions` the checks need. */
export type AccessSnapshot = Pick<MePermissionsDto, "isAdmin" | "grants">;

/** Whether the user may do `permission`. The admin role holds every permission implicitly. */
export function can(access: AccessSnapshot, permission: Permission): boolean {
  if (access.isAdmin) return true;
  const [resource, action] = permission.split(":");
  return access.grants.some((grant) => grant.resource === resource && grant.action === action);
}

/** True when the user holds any of the permissions; an empty list means "any signed-in user". */
export function canAny(access: AccessSnapshot, permissions: readonly Permission[]): boolean {
  if (permissions.length === 0) return true;
  return permissions.some((permission) => can(access, permission));
}
