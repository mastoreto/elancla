import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import { lockRole } from "../../../../../core/authz";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { NotFoundError } from "../../../../../core/errors";
import { countRoleMembersIn, deleteRoleRow, findRoleRowIn } from "../../data";
import { toRoleDto } from "../../mappers";
import { assertCanManageRoles, assertRoleDeletable } from "../../policies";

export async function deleteRole(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  assertCanManageRoles(ctx.access);
  await withTransaction(db, async (tx) => {
    // The lock makes a concurrent assignment wait: the member count below is then final.
    await lockRole(tx, id);
    const current = await findRoleRowIn(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The role was not found");
    assertRoleDeletable(ctx.access, {
      ...current,
      memberCount: await countRoleMembersIn(tx, id),
    });
    await deleteRoleRow(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.role.deleted,
      entity: { type: "role", id },
      before: toRoleDto(current),
      metadata: { entityLabel: current.name },
    });
  });
}
