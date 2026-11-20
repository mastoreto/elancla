import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const LIST_LIMIT = 100;

export interface NewSiteKey {
  organizationId: string;
  name: string;
  secretHash: string;
  createdById: string | null;
}

/**
 * Active keys first, then the most recently revoked: however many revoked ones pile up, the limit
 * never hides a live key.
 */
export function listSiteKeyRows(organizationId: string) {
  return forOrganization(db, organizationId).siteApiKey.findMany({
    orderBy: [{ revokedAt: { sort: "desc", nulls: "first" } }, { id: "desc" }],
    take: LIST_LIMIT,
  });
}

/**
 * Serializes the transactions that create keys for one organization: the second waits here until
 * the first commits, so the count of active keys it reads afterwards is current.
 */
export async function lockOrganizationKeys(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "organizations" WHERE "id" = ${organizationId}::uuid FOR UPDATE`;
}

export function countActiveSiteKeyRows(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<number> {
  return tx.siteApiKey.count({ where: { organizationId, revokedAt: null } });
}

export function createSiteKeyRow(
  tx: Prisma.TransactionClient,
  input: NewSiteKey,
) {
  return tx.siteApiKey.create({ data: input });
}

/** The key if it belongs to the organization and is still active. */
export function findActiveSiteKeyRowIn(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
) {
  return tx.siteApiKey.findFirst({
    where: { id, organizationId, revokedAt: null },
  });
}

export function markSiteKeyRevoked(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
) {
  return tx.siteApiKey.update({
    where: { id, organizationId },
    data: { revokedAt: new Date() },
  });
}
