import { db } from "@ancla/db";
import type { AuthenticatedContext } from "../../context";
import { ForbiddenError } from "../../errors";
import { forOrganization } from "../../tenancy";
import { coversGrants } from "../coversGrants";
import { toPermissionGrants } from "../toPermissionGrants";

export const ROLE_NOT_COVERED_MESSAGE =
  "You can only assign roles whose permissions you hold with an equal or wider scope";

/**
 * A non-admin may only hand out roles whose grants are all covered by their own (equal or wider
 * scope), so assigning or inviting cannot be used to gain more than they hold. Admins skip it.
 */
export async function assertCanAssignRoles(
  ctx: Pick<AuthenticatedContext, "access" | "organizationId">,
  roleIds: readonly string[],
): Promise<void> {
  if (ctx.access.isAdmin || roleIds.length === 0) return;
  const roles = await forOrganization(db, ctx.organizationId).role.findMany({
    where: { id: { in: [...roleIds] } },
    select: {
      permissions: { select: { resource: true, action: true, scope: true } },
    },
  });
  const covered = roles.every((role) =>
    coversGrants(ctx.access, toPermissionGrants(role.permissions)),
  );
  if (!covered) throw new ForbiddenError(ROLE_NOT_COVERED_MESSAGE);
}
