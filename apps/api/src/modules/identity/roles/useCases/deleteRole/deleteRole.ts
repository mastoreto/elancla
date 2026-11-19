import { db } from "@ancla/db";
import { lockRole } from "../../../../../core/authz";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { NotFoundError } from "../../../../../core/errors";
import { countRoleMembersIn, deleteRoleRow, findRoleRow } from "../../data";
import { assertCanManageRoles, assertRoleDeletable } from "../../policies";

export async function deleteRole(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  assertCanManageRoles(ctx.access);
  // ponytail: 0.5 adds `writeAudit(tx, ...)` here, inside the same transaction.
  await withTransaction(db, async (tx) => {
    // The lock makes a concurrent assignment wait: the member count below is then final.
    await lockRole(tx, id);
    const current = await findRoleRow(ctx.organizationId, id);
    if (!current) throw new NotFoundError("The role was not found");
    assertRoleDeletable(ctx.access, {
      ...current,
      memberCount: await countRoleMembersIn(tx, id),
    });
    await deleteRoleRow(tx, ctx.organizationId, id);
  });
}
