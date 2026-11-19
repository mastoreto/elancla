import {
  AUDIT_ACTIONS,
  type SetUserRolesBody,
  type UserDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import { assertCanAssignRoles, lockRoles } from "../../../../../core/authz";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { NotFoundError, ValidationError } from "../../../../../core/errors";
import {
  countRoleMembers,
  findAdminRoleId,
  findExistingRoleIds,
  findExistingRoleIdsIn,
  findUserRoleSummaries,
  findUserRow,
  hasRole,
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
  const target = await findUserRow(userId);
  if (!target) throw new NotFoundError("The user was not found");

  const roleIds = [...new Set(body.roleIds)];
  const existing = new Set(
    await findExistingRoleIds(ctx.organizationId, roleIds),
  );
  if (!roleIds.every((id) => existing.has(id))) {
    throw new ValidationError("The request is not valid", [
      { path: "roleIds", message: "Contains an id that does not exist" },
    ]);
  }

  await assertCanAssignRoles(ctx, roleIds);

  await withTransaction(db, async (tx) => {
    const adminRoleId = await findAdminRoleId(ctx.organizationId);
    // Without the admin lock, two admins demoting each other would both see "two admins left".
    // Locking the assigned roles too keeps a concurrent delete of one of them from slipping in.
    await lockRoles(tx, adminRoleId ? [adminRoleId, ...roleIds] : roleIds);
    const stillExisting = await findExistingRoleIdsIn(
      tx,
      ctx.organizationId,
      roleIds,
    );
    if (stillExisting.length !== roleIds.length) {
      throw new ValidationError("The request is not valid", [
        { path: "roleIds", message: "Contains an id that does not exist" },
      ]);
    }
    if (adminRoleId) {
      assertAdminRoleChangeAllowed({
        access: ctx.access,
        adminRoleId,
        hadAdminRole: await hasRole(tx, userId, adminRoleId),
        keepsAdminRole: roleIds.includes(adminRoleId),
        adminCount: await countRoleMembers(tx, adminRoleId),
      });
    }
    const before = await findUserRoleSummaries(tx, userId);
    await replaceUserRoles(tx, userId, roleIds);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.user.rolesChanged,
      entity: { type: "user", id: userId },
      before: { roles: before },
      after: { roles: await findUserRoleSummaries(tx, userId) },
      metadata: { entityLabel: target.email },
    });
  });

  const row = await findUserRow(userId);
  if (!row) throw new NotFoundError("The user was not found");
  return toUserDto(row);
}
