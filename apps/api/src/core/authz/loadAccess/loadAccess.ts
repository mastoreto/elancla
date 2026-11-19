import { ADMIN_ROLE_KEY } from "@ancla/contracts";
import { db } from "@ancla/db";
import type { Access } from "../../context";
import { mergeGrants } from "../mergeGrants";
import { mergeSessionPolicy } from "../mergeSessionPolicy";
import { toPermissionGrants } from "../toPermissionGrants";

/** Roles and ministries of a user in one round trip. Never trusts anything from the cookie. */
export async function loadAccess(
  userId: string,
  organizationId: string,
): Promise<Access> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      userRoles: {
        where: { role: { organizationId } },
        select: {
          role: {
            select: {
              id: true,
              key: true,
              name: true,
              persistentSession: true,
              maxSessionSeconds: true,
              permissions: {
                select: { resource: true, action: true, scope: true },
              },
            },
          },
        },
      },
      userMinistries: {
        where: { ministry: { organizationId } },
        select: { ministryId: true },
      },
    },
  });
  const roles = user?.userRoles.map(({ role }) => role) ?? [];
  const isAdmin = roles.some((role) => role.key === ADMIN_ROLE_KEY);
  return {
    isAdmin,
    roles: roles.map(({ id, name }) => ({ id, name })),
    grants: mergeGrants(
      roles.map((role) => toPermissionGrants(role.permissions)),
    ),
    ministryIds: user?.userMinistries.map((row) => row.ministryId) ?? [],
    sessionPolicy: mergeSessionPolicy(roles),
  };
}
