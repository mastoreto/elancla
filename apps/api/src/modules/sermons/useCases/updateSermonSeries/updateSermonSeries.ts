import {
  AUDIT_ACTIONS,
  type SermonSeriesDto,
  type UpdateSermonSeriesBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { StaleVersionError } from "../../../blog";
import { findSeriesRow, replaceSeriesIfVersion } from "../../data";
import { toSermonSeriesDto } from "../../mappers";
import { assertSeriesInput } from "../assertSeriesInput";
import { loadSeriesSummaries } from "../loadSeriesSummaries";

/** Replaces the fields and the translations; `version` is the one the editor loaded. */
export async function updateSermonSeries(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateSermonSeriesBody,
): Promise<SermonSeriesDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const summaries = await loadSeriesSummaries(ctx.organizationId);
  return withTransaction(db, async (tx) => {
    const current = await findSeriesRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The series was not found");
    await assertSeriesInput(tx, ctx.organizationId, body, id);

    const applied = await replaceSeriesIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findSeriesRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The series was not found");
    const after = toSermonSeriesDto(updated, summaries.get(id), publicBaseUrl);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermonSeries.updated,
      entity: { type: "sermonSeries", id },
      before: toSermonSeriesDto(current, summaries.get(id), publicBaseUrl),
      after,
    });
    return after;
  });
}
