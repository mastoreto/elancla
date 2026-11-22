import {
  AUDIT_ACTIONS,
  type ScheduleSetDto,
  type UpdateScheduleSetBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import { assertTranslationLocales } from "../../../ministries";
import {
  findScheduleSetRow,
  releaseExclusiveFlags,
  replaceScheduleSetIfVersion,
} from "../../data";
import { toScheduleSetDto } from "../../mappers";

/** Replaces the fields and the translations; `version` is the one the editor loaded. */
export function updateScheduleSet(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateScheduleSetBody,
): Promise<ScheduleSetDto> {
  return withTransaction(db, async (tx) => {
    const current = await findScheduleSetRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The schedule set was not found");
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    await releaseExclusiveFlags(tx, {
      organizationId: ctx.organizationId,
      exceptId: id,
      flags: body,
    });

    const applied = await replaceScheduleSetIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findScheduleSetRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The schedule set was not found");
    const after = toScheduleSetDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.scheduleSet.updated,
      entity: { type: "scheduleSet", id },
      before: toScheduleSetDto(current),
      after,
    });
    return after;
  });
}
