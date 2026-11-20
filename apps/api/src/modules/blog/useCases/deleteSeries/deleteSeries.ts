import { AUDIT_ACTIONS, type BlogPostSnapshot } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { listLiveSnapshots } from "../../../editorial";
import { findSeriesRow, softDeleteSeries } from "../../data";
import { TaxonomyInUseError } from "../../domain";
import { toSeriesDto } from "../../mappers";

/** Logical delete. A series a live post points at cannot go (409 `series_in_use`). */
export function deleteSeries(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findSeriesRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The series was not found");
    const live = await listLiveSnapshots(ctx.organizationId, "BLOG_POST");
    // ponytail: in-memory scan, same as the public reads.
    const inUse = live.some(
      ({ snapshot }) =>
        (snapshot as unknown as BlogPostSnapshot).seriesId === id,
    );
    if (inUse) {
      throw new TaxonomyInUseError(
        "series_in_use",
        "A published post belongs to this series; remove it from the series first",
      );
    }
    await softDeleteSeries(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.series.deleted,
      entity: { type: "series", id },
      before: toSeriesDto(current),
    });
  });
}
