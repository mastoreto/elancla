import type { SetUserRolesBody, UserDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { NotFoundError, ValidationError } from "../../../../../core/errors";
import {
  countRoleMembers,
  findAdminRoleId,
  findExistingRoleIds,
  findUserRow,
  hasRole,
  lockRole,
  replaceUserRoles,
} from "../../data";
import { toUserDto } from "../../mappers";
import { assertAdminRoleChangeAllowed, assertNotSelf } from "../../policies";

interface SetUserRolesInput {
  ctx: AuthenticatedContext;
  userId: string;
  body: SetUserRolesBody;
}

/** Replaces the roles of a user. Guarded by the self-change and last-admin policies. */
export async function setUserRoles({
  ctx,
  userId,
  body,
}: SetUserRolesInput): Promise<UserDto> {
  assertNotSelf(ctx.user.id, userId);
  if (!(await findUserRow(userId)))
    throw new NotFoundError("The user was not found");

  const roleIds = [...new Set(body.roleIds)];
  const existing = new Set(
    await findExistingRoleIds(ctx.organizationId, roleIds),
  );
  if (!roleIds.every((id) => existing.has(id))) {
    throw new ValidationError("The request is not valid", [
      { path: "roleIds", message: "Contains an id that does not exist" },
    ]);
  }

  // ponytail: 0.5 adds `writeAudit(tx, ...)` here, inside the same transaction.
  await withTransaction(db, async (tx) => {
    const adminRoleId = await findAdminRoleId(ctx.organizationId);
    if (adminRoleId) {
      // Without the lock, two admins demoting each other would both see "two admins left".
      await lockRole(tx, adminRoleId);
      assertAdminRoleChangeAllowed({
        access: ctx.access,
        adminRoleId,
        hadAdminRole: await hasRole(tx, userId, adminRoleId),
        keepsAdminRole: roleIds.includes(adminRoleId),
        adminCount: await countRoleMembers(tx, adminRoleId),
      });
    }
    await replaceUserRoles(tx, userId, roleIds);
  });

  const row = await findUserRow(userId);
  if (!row) throw new NotFoundError("The user was not found");
  return toUserDto(row);
}
