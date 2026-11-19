import { db } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { NotFoundError } from "../../../../../core/errors";
import { deleteRoleRow, findRoleRow } from "../../data";
import { assertRoleDeletable } from "../../policies";

export async function deleteRole(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  const current = await findRoleRow(ctx.organizationId, id);
  if (!current) throw new NotFoundError("The role was not found");
  assertRoleDeletable(ctx.access, {
    ...current,
    memberCount: current._count.members,
  });
  // ponytail: 0.5 adds `writeAudit(tx, ...)` here, inside the same transaction.
  await withTransaction(db, (tx) => deleteRoleRow(tx, ctx.organizationId, id));
}
