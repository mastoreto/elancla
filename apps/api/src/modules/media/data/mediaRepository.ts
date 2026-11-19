import { db, type MediaFile, type MediaPurpose, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import type { StoredVariant } from "../domain";

interface NewMediaFile {
  id: string;
  purpose: MediaPurpose;
  key: string;
  contentType: string;
  size: number;
  originalName: string;
  uploadedById: string;
}

export function findMediaFileRow(
  organizationId: string,
  id: string,
): Promise<MediaFile | null> {
  return forOrganization(db, organizationId).mediaFile.findFirst({
    where: { id },
  });
}

export function createMediaFileRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  file: NewMediaFile,
): Promise<MediaFile> {
  return tx.mediaFile.create({ data: { organizationId, ...file } });
}

interface ReadyMediaFile {
  size: number;
  checksum: string;
  variants: StoredVariant[] | null;
}

/** Only a still-pending row can become ready: a concurrent `finalize` updates zero rows. */
export async function markMediaFileReady(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
  file: ReadyMediaFile,
): Promise<MediaFile | null> {
  const { count } = await tx.mediaFile.updateMany({
    where: { id, organizationId, status: "pending" },
    data: {
      status: "ready",
      size: file.size,
      checksum: file.checksum,
      variants: file.variants ?? undefined,
      finalizedAt: new Date(),
    },
  });
  if (count === 0) return null;
  return tx.mediaFile.findFirst({ where: { id, organizationId } });
}

export async function deleteMediaFileRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.mediaFile.deleteMany({ where: { id, organizationId } });
}

/**
 * Stale pending uploads of EVERY organization. The unscoped client is deliberate: the purge is a
 * system job with no tenant, and each row is then handled under its own organization.
 */
export function listStalePendingRows(
  cutoff: Date,
  limit: number,
): Promise<MediaFile[]> {
  return db.mediaFile.findMany({
    where: { status: "pending", createdAt: { lt: cutoff } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

/** Deletes the row only if it is still pending (a `finalize` may have won the race). */
export async function deletePendingMediaFileRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const { count } = await tx.mediaFile.deleteMany({
    where: { id, organizationId, status: "pending" },
  });
  return count > 0;
}
