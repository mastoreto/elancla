import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

type Client = Prisma.TransactionClient | typeof db;

/** Newest created first (a v7 uuid is time ordered). */
export function listSermonRows(
  organizationId: string,
): Promise<{ id: string }[]> {
  return forOrganization(db, organizationId).sermon.findMany({
    select: { id: true },
    orderBy: { id: "desc" },
  });
}

export function findSermonRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<{ id: string; firstLiveAt: Date | null } | null> {
  return client.sermon.findFirst({
    where: { id, organizationId },
    select: { id: true, firstLiveAt: true },
  });
}

/** A sermon with no content yet: its content goes through the editorial workflow. */
export function createSermonRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<{ id: string }> {
  return tx.sermon.create({ data: { organizationId }, select: { id: true } });
}

export async function deleteSermonRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.sermon.deleteMany({ where: { id, organizationId } });
}
