import {
  AUDIT_ACTIONS,
  type CreateRoleBody,
  type RoleDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { ConflictError } from "../../../../../core/errors";
import {
  createRoleRow,
  findRoleRowByName,
  findRoleRowIn,
  isUniqueViolation,
} from "../../data";
import { toRoleDto } from "../../mappers";
import { assertCanManageRoles } from "../../policies";

export const ROLE_NAME_TAKEN_MESSAGE = "A role with this name already exists";

interface CreateRoleInput {
  ctx: AuthenticatedContext;
  body: CreateRoleBody;
}

export async function createRole({
  ctx,
  body,
}: CreateRoleInput): Promise<RoleDto> {
  assertCanManageRoles(ctx.access);
  if (await findRoleRowByName(ctx.organizationId, body.name)) {
    throw new ConflictError(ROLE_NAME_TAKEN_MESSAGE);
  }
  return withTransaction(db, async (tx) => {
    const { id } = await createRoleRow(tx, ctx.organizationId, body);
    const row = await findRoleRowIn(tx, ctx.organizationId, id);
    if (!row) throw new Error("The role vanished right after being created");
    const created = toRoleDto(row);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.role.created,
      entity: { type: "role", id },
      after: created,
      metadata: { entityLabel: created.name },
    });
    return created;
  }).catch((error: unknown) => {
    if (isUniqueViolation(error))
      throw new ConflictError(ROLE_NAME_TAKEN_MESSAGE);
    throw error;
  });
}
