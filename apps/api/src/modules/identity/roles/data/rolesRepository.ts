import type { CreateRoleBody } from "@ancla/contracts";
import { db, Prisma } from "@ancla/db";
import { forOrganization } from "../../../../core/tenancy";

const roleInclude = {
  permissions: { select: { resource: true, action: true, scope: true } },
  _count: { select: { members: true } },
} satisfies Prisma.RoleInclude;

export type RoleRow = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

export function listRoleRows(organizationId: string): Promise<RoleRow[]> {
  return forOrganization(db, organizationId).role.findMany({
    include: roleInclude,
    orderBy: { name: "asc" },
  });
}

export function findRoleRow(
  organizationId: string,
  id: string,
): Promise<RoleRow | null> {
  return forOrganization(db, organizationId).role.findFirst({
    where: { id },
    include: roleInclude,
  });
}

export function findRoleRowByName(
  organizationId: string,
  name: string,
): Promise<{ id: string } | null> {
  return forOrganization(db, organizationId).role.findFirst({
    where: { name },
    select: { id: true },
  });
}

export function createRoleRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: CreateRoleBody,
): Promise<{ id: string }> {
  const { grants, ...fields } = body;
  return tx.role.create({
    data: { organizationId, ...fields, permissions: { create: grants } },
    select: { id: true },
  });
}

/** Replaces the name, session policy and the whole grid of a role. */
export async function replaceRoleRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
  body: CreateRoleBody,
): Promise<void> {
  const { grants, ...fields } = body;
  await tx.role.update({ where: { id, organizationId }, data: fields });
  await tx.rolePermission.deleteMany({ where: { roleId: id } });
  await tx.rolePermission.createMany({
    data: grants.map((grant) => ({ roleId: id, ...grant })),
  });
}

export async function deleteRoleRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.role.delete({ where: { id, organizationId } });
}

/** True for the unique-constraint error of `(organizationId, name)`. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** Member count read inside the transaction that holds the role lock. */
export function countRoleMembersIn(
  tx: Prisma.TransactionClient,
  roleId: string,
): Promise<number> {
  return tx.userRole.count({ where: { roleId } });
}
