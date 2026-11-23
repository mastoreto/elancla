import {
  AUDIT_ACTIONS,
  type SermonSeriesDto,
  type UpsertSermonSeriesBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { getStorageEnv } from "../../../../core/storage";
import { createSeriesRow } from "../../data";
import { toSermonSeriesDto } from "../../mappers";
import { assertSeriesInput } from "../assertSeriesInput";

export function createSermonSeries(
  ctx: AuthenticatedContext,
  body: UpsertSermonSeriesBody,
): Promise<SermonSeriesDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  return withTransaction(db, async (tx) => {
    await assertSeriesInput(tx, ctx.organizationId, body);
    // A new series has no sermons yet: no summary to compute.
    const created = toSermonSeriesDto(
      await createSeriesRow(tx, ctx.organizationId, body),
      undefined,
      publicBaseUrl,
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermonSeries.created,
      entity: { type: "sermonSeries", id: created.id },
      after: created,
    });
    return created;
  });
}
