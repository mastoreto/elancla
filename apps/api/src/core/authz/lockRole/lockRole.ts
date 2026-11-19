import type { Prisma } from "@ancla/db";

/**
 * Serializes the transactions that change who holds a role (or delete it): the second one waits
 * here until the first commits, so what it reads afterwards (members, existence) is current.
 * Lock several roles in sorted id order (`lockRoles`) so two transactions cannot deadlock.
 */
export async function lockRole(
  tx: Prisma.TransactionClient,
  roleId: string,
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "roles" WHERE "id" = ${roleId}::uuid FOR UPDATE`;
}

export async function lockRoles(
  tx: Prisma.TransactionClient,
  roleIds: readonly string[],
): Promise<void> {
  for (const id of [...new Set(roleIds)].sort()) {
    await lockRole(tx, id);
  }
}
