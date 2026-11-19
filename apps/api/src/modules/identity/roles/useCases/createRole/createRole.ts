import type { CreateRoleBody, RoleDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { ConflictError } from "../../../../../core/errors";
import {
  createRoleRow,
  findRoleRow,
  findRoleRowByName,
  isUniqueViolation,
} from "../../data";
import { toRoleDto } from "../../mappers";

export const ROLE_NAME_TAKEN_MESSAGE = "A role with this name already exists";

interface CreateRoleInput {
  ctx: AuthenticatedContext;
  body: CreateRoleBody;
}

export async function createRole({
  ctx,
  body,
}: CreateRoleInput): Promise<RoleDto> {
  if (await findRoleRowByName(ctx.organizationId, body.name)) {
    throw new ConflictError(ROLE_NAME_TAKEN_MESSAGE);
  }
  // ponytail: 0.5 adds `writeAudit(tx, ...)` here, inside the same transaction.
  const created = await withTransaction(db, (tx) =>
    createRoleRow(tx, ctx.organizationId, body),
  ).catch((error: unknown) => {
    if (isUniqueViolation(error))
      throw new ConflictError(ROLE_NAME_TAKEN_MESSAGE);
    throw error;
  });
  const row = await findRoleRow(ctx.organizationId, created.id);
  if (!row) throw new Error("The role vanished right after being created");
  return toRoleDto(row);
}
