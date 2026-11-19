import type { Permission } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../context";
import { scopeOf } from "../scopeOf";

interface ScopeFields {
  /** Column holding the user who owns the row; needed for the `own` scope. */
  ownerField?: string;
  /** Column holding the ministry of the row; needed for the `ministry` scope. */
  ministryField?: string;
}

/** A filter no row can satisfy: the resource cannot express the scope, so nothing is visible. */
const MATCH_NOTHING = { id: { in: [] as string[] } };

/**
 * Prisma `where` fragment that limits a query to what the user's scope on `permission` allows.
 * Fails closed: no grant, or a scope the resource has no column for, matches nothing.
 */
export function scopeWhere(
  ctx: Pick<AuthenticatedContext, "access" | "user">,
  permission: Permission,
  fields: ScopeFields = {},
): Record<string, unknown> {
  const scope = scopeOf(ctx.access, permission);
  if (scope === "all") return {};
  if (scope === "ministry" && fields.ministryField) {
    return { [fields.ministryField]: { in: ctx.access.ministryIds } };
  }
  if (scope === "own" && fields.ownerField) {
    return { [fields.ownerField]: ctx.user.id };
  }
  return MATCH_NOTHING;
}
