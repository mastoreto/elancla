import { AUDIT_ACTIONS, type SermonSnapshot } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { listCurrentRevisionRows } from "../../../editorial";
import { findSeriesRow, softDeleteSeries } from "../../data";
import { SeriesInUseError } from "../../domain";
import { toSermonSeriesDto } from "../../mappers";
import { loadSeriesSummaries } from "../loadSeriesSummaries";

/**
 * Logical delete. A series any sermon points at, live or still being edited, cannot go (409
 * `series_in_use`): the sermon would be left pointing at nothing.
 */
export async function deleteSermonSeries(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const [revisions, summaries] = await Promise.all([
    listCurrentRevisionRows(ctx.organizationId, "SERMON"),
    loadSeriesSummaries(ctx.organizationId),
  ]);
  return withTransaction(db, async (tx) => {
    const current = await findSeriesRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The series was not found");
    // ponytail: in-memory scan, same as the public reads.
    const inUse = revisions.some(
      ({ snapshot }) => (snapshot as unknown as SermonSnapshot).seriesId === id,
    );
    if (inUse) throw new SeriesInUseError();
    await softDeleteSeries(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermonSeries.deleted,
      entity: { type: "sermonSeries", id },
      before: toSermonSeriesDto(current, summaries.get(id), publicBaseUrl),
    });
  });
}
