import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db, type MediaFile } from "@ancla/db";
import { auditSourceForSystem, writeAudit } from "../../../../core/audit";
import { withTransaction } from "../../../../core/db";
import { getStorage } from "../../../../core/storage";
import { deletePendingMediaFileRow, listStalePendingRows } from "../../data";

export const CRON_ACTOR_LABEL = "cron";
/** A pending upload older than this was abandoned: its presigned URL lived five minutes. */
export const STALE_PENDING_AFTER_MS = 60 * 60 * 1000;
/** ponytail: one bounded pass per run; the rest goes on the next day's run. */
const PURGE_BATCH_SIZE = 1000;

/** Removes the object, then the row and its audit entry, of one abandoned upload. */
async function purgeOne(row: MediaFile): Promise<boolean> {
  await getStorage("private").delete(row.key);
  return withTransaction(db, async (tx) => {
    const deleted = await deletePendingMediaFileRow(
      tx,
      row.organizationId,
      row.id,
    );
    if (!deleted) return false;
    await writeAudit(
      tx,
      auditSourceForSystem(row.organizationId, CRON_ACTOR_LABEL),
      {
        action: AUDIT_ACTIONS.media.purged,
        entity: { type: "mediaFile", id: row.id },
        metadata: {
          entityLabel: row.originalName,
          purpose: row.purpose,
          pendingSince: row.createdAt.toISOString(),
        },
      },
    );
    return true;
  });
}

/**
 * Deletes the uploads that stayed pending for over an hour. A failure on one file is logged and
 * does not stop the others (it is retried on the next run). Returns how many were removed.
 */
export async function purgeStaleUploads(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - STALE_PENDING_AFTER_MS);
  const rows = await listStalePendingRows(cutoff, PURGE_BATCH_SIZE);
  let purged = 0;
  for (const row of rows) {
    try {
      if (await purgeOne(row)) purged += 1;
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          job: "media.purge",
          mediaFileId: row.id,
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
  return purged;
}
