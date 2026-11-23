import type { Prisma, PrismaClient } from "../../src";

export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Seeded revisions are written PUBLISHED directly (what `publish` leaves), so they need an author:
 * the oldest user holding a role in the organization. `null` on a brand new database.
 */
export async function findAuthorUserId(
  client: PrismaClient,
  organizationId: string,
): Promise<string | null> {
  const user = await client.user.findFirst({
    where: { userRoles: { some: { role: { organizationId } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return user?.id ?? null;
}
