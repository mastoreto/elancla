import type { Prisma } from "@ancla/db";

export async function ministryExists(
  tx: Prisma.TransactionClient,
  organizationId: string,
  entityId: string,
): Promise<boolean> {
  const found = await tx.ministry.findFirst({
    where: { id: entityId, organizationId },
    select: { id: true },
  });
  return found !== null;
}
