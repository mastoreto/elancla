import {
  AUDIT_ACTIONS,
  type ScheduleExceptionDto,
  type UpsertScheduleExceptionBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { assertTranslationLocales } from "../../../ministries";
import { createExceptionRow } from "../../data";
import { toScheduleExceptionDto } from "../../mappers";
import { assertExceptionReferences } from "../assertExceptionReferences";

export function createScheduleException(
  ctx: AuthenticatedContext,
  body: UpsertScheduleExceptionBody,
): Promise<ScheduleExceptionDto> {
  return withTransaction(db, async (tx) => {
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    await assertExceptionReferences(tx, {
      organizationId: ctx.organizationId,
      body,
    });
    const created = toScheduleExceptionDto(
      await createExceptionRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.scheduleException.created,
      entity: { type: "scheduleException", id: created.id },
      after: created,
    });
    return created;
  });
}
