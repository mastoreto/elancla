import type { RoleDto, UpdateRoleBody } from "@ancla/contracts";
import { db } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { ConflictError, NotFoundError } from "../../../../../core/errors";
import { findRoleRow, isUniqueViolation, replaceRoleRow } from "../../data";
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
  const current = await findRoleRow(ctx.organizationId, id);
  if (!current) throw new NotFoundError("The role was not found");
  assertRoleEditable(ctx.access, {
    ...current,
    memberCount: current._count.members,
  });

  // ponytail: 0.5 adds `writeAudit(tx, ...)` here, inside the same transaction.
  await withTransaction(db, (tx) =>
    replaceRoleRow(tx, ctx.organizationId, id, body),
  ).catch((error: unknown) => {
    if (isUniqueViolation(error))
      throw new ConflictError(ROLE_NAME_TAKEN_MESSAGE);
    throw error;
  });
  const row = await findRoleRow(ctx.organizationId, id);
  if (!row) throw new NotFoundError("The role was not found");
  return toRoleDto(row);
}
