import { fromPermission, type MePermissionsDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../core/context";

/** What the CRM needs to draw its menu: no query, the access was loaded with the session. */
export function getMyPermissions({
  access,
}: Pick<AuthenticatedContext, "access">): MePermissionsDto {
  return {
    isAdmin: access.isAdmin,
    roles: access.roles,
    grants: [...access.grants].map(([permission, scope]) => ({
      ...fromPermission(permission),
      scope,
    })),
    ministryIds: access.ministryIds,
  };
}
