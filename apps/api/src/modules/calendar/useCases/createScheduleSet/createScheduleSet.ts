import {
  AUDIT_ACTIONS,
  type ScheduleSetDto,
  type UpsertScheduleSetBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { assertTranslationLocales } from "../../../ministries";
import { createScheduleSetRow, releaseExclusiveFlags } from "../../data";
import { toScheduleSetDto } from "../../mappers";

/** Turning `isDefault` or `forcedActive` on moves the flag from the set that had it. */
export function createScheduleSet(
  ctx: AuthenticatedContext,
  body: UpsertScheduleSetBody,
): Promise<ScheduleSetDto> {
  return withTransaction(db, async (tx) => {
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    await releaseExclusiveFlags(tx, {
      organizationId: ctx.organizationId,
      flags: body,
    });
    const created = toScheduleSetDto(
      await createScheduleSetRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.scheduleSet.created,
      entity: { type: "scheduleSet", id: created.id },
      after: created,
    });
    return created;
  });
}
