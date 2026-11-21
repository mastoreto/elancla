import type { Permission } from "@ancla/contracts";
import { scopeOf } from "../../../../core/authz";
import type { Access } from "../../../../core/context";
import { ForbiddenError } from "../../../../core/errors";

/**
 * The settings of a ministry (category, destination, leaders, landing mosaic...) belong to a role,
 * not to the leader of that ministry: they need the permission with scope `all`, a `ministry`
 * scope is a 403 even on the leader's own ministry.
 */
export function requireAllScope(access: Access, permission: Permission): void {
  if (scopeOf(access, permission) !== "all") throw new ForbiddenError();
}
