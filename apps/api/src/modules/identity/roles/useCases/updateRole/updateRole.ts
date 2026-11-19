import {
  AUDIT_ACTIONS,
  type RoleDto,
  type UpdateRoleBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import { lockRole } from "../../../../../core/authz";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { ConflictError, NotFoundError } from "../../../../../core/errors";
import { findRoleRowIn, isUniqueViolation, replaceRoleRow } from "../../data";
import { toRoleDto } from "../../mappers";
import { assertCanManageRoles, assertRoleEditable } from "../../policies";
import { ROLE_NAME_TAKEN_MESSAGE } from "../createRole";

interface UpdateRoleInput {
  ctx: AuthenticatedContext;
  id: string;
  body: UpdateRoleBody;
}

export async function updateRole({
  ctx,
  id,
  body,
}: UpdateRoleInput): Promise<RoleDto> {
  assertCanManageRoles(ctx.access);
  return withTransaction(db, async (tx) => {
    // The lock keeps a concurrent assignment or delete from changing the role under the audit.
    await lockRole(tx, id);
    const current = await findRoleRowIn(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The role was not found");
    assertRoleEditable(ctx.access, {
      ...current,
      memberCount: current._count.members,
    });

    await replaceRoleRow(tx, ctx.organizationId, id, body);
    const row = await findRoleRowIn(tx, ctx.organizationId, id);
    if (!row) throw new NotFoundError("The role was not found");
    const updated = toRoleDto(row);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.role.updated,
      entity: { type: "role", id },
      before: toRoleDto(current),
      after: updated,
      metadata: { entityLabel: updated.name },
    });
    return updated;
  }).catch((error: unknown) => {
    if (isUniqueViolation(error))
      throw new ConflictError(ROLE_NAME_TAKEN_MESSAGE);
    throw error;
  });
}
