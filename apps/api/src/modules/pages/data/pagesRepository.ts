import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

/** Newest first; the id (a v7 uuid) breaks ties of pages created in the same millisecond. */
export function listSimplePageRows(organizationId: string) {
  return forOrganization(db, organizationId).simplePage.findMany({
    select: { id: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function findDefaultLocale(
  organizationId: string,
): Promise<string> {
  const { defaultLocale } = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { defaultLocale: true },
  });
  return defaultLocale;
}

export function createSimplePageRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<{ id: string }> {
  return tx.simplePage.create({
    data: { organizationId },
    select: { id: true },
  });
}
