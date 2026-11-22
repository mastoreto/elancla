import {
  AUDIT_ACTIONS,
  type ScheduleExceptionDto,
  type UpdateScheduleExceptionBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import { assertTranslationLocales } from "../../../ministries";
import { findExceptionRow, replaceExceptionIfVersion } from "../../data";
import { toScheduleExceptionDto } from "../../mappers";
import { assertExceptionReferences } from "../assertExceptionReferences";

/** Replaces the date, the replacement and the messages; `version` is the one the editor loaded. */
export function updateScheduleException(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdateScheduleExceptionBody,
): Promise<ScheduleExceptionDto> {
  return withTransaction(db, async (tx) => {
    const current = await findExceptionRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The exception was not found");
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    await assertExceptionReferences(tx, {
      organizationId: ctx.organizationId,
      body,
      exceptId: id,
    });

    const applied = await replaceExceptionIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findExceptionRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The exception was not found");
    const after = toScheduleExceptionDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.scheduleException.updated,
      entity: { type: "scheduleException", id },
      before: toScheduleExceptionDto(current),
      after,
    });
    return after;
  });
}
