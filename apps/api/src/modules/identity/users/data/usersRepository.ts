import { ADMIN_ROLE_KEY } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../../core/tenancy";

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  userRoles: { select: { role: { select: { id: true, name: true } } } },
  userMinistries: {
    select: { ministry: { select: { id: true, name: true } } },
  },
  // The newest session start is the "last access".
  sessions: {
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} satisfies Prisma.UserSelect;

export type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

/**
 * ponytail: `users` has no tenant column (Better Auth core table) and there is one organization,
 * so every user belongs to it. Membership becomes explicit when a second tenant exists.
 */
export function listUserRows(page: {
  cursor?: string;
  limit: number;
}): Promise<UserRow[]> {
  return db.user.findMany({
    select: userSelect,
    orderBy: { id: "desc" },
    take: page.limit + 1,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
}

export function findUserRow(id: string): Promise<UserRow | null> {
  return db.user.findUnique({ where: { id }, select: userSelect });
}

export async function findExistingRoleIds(
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  const rows = await forOrganization(db, organizationId).role.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function findExistingMinistryIds(
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  const rows = await forOrganization(db, organizationId).ministry.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

/** Same as `findExistingRoleIds`, inside a transaction (after the roles were locked). */
export async function findExistingRoleIdsIn(
  tx: Prisma.TransactionClient,
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  const rows = await tx.role.findMany({
    where: { organizationId, id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function findAdminRoleId(
  organizationId: string,
): Promise<string | null> {
  const role = await forOrganization(db, organizationId).role.findFirst({
    where: { key: ADMIN_ROLE_KEY },
    select: { id: true },
  });
  return role?.id ?? null;
}

export function countRoleMembers(
  tx: Prisma.TransactionClient,
  roleId: string,
): Promise<number> {
  return tx.userRole.count({ where: { roleId } });
}

export function hasRole(
  tx: Prisma.TransactionClient,
  userId: string,
  roleId: string,
): Promise<boolean> {
  return tx.userRole
    .count({ where: { userId, roleId } })
    .then((count) => count > 0);
}

export async function replaceUserRoles(
  tx: Prisma.TransactionClient,
  userId: string,
  roleIds: string[],
): Promise<void> {
  await tx.userRole.deleteMany({ where: { userId } });
  await tx.userRole.createMany({
    data: roleIds.map((roleId) => ({ userId, roleId })),
  });
}

export async function replaceUserMinistries(
  userId: string,
  ministryIds: string[],
): Promise<void> {
  await db.$transaction([
    db.userMinistry.deleteMany({ where: { userId } }),
    db.userMinistry.createMany({
      data: ministryIds.map((ministryId) => ({ userId, ministryId })),
    }),
  ]);
}
