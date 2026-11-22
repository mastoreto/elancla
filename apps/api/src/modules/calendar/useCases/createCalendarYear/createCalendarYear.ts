import {
  AUDIT_ACTIONS,
  type CalendarYearDto,
  type CreateCalendarYearBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createYearRow, findYearRow } from "../../data";
import { YearExistsError } from "../../domain";
import { toCalendarYearDto } from "../../mappers";

/** A new calendar year, always a draft: its events only save drafts until the year is published. */
export function createCalendarYear(
  ctx: AuthenticatedContext,
  { year }: CreateCalendarYearBody,
): Promise<CalendarYearDto> {
  return withTransaction(db, async (tx) => {
    if (await findYearRow(tx, ctx.organizationId, year)) {
      throw new YearExistsError();
    }
    const created = toCalendarYearDto(
      await createYearRow(tx, ctx.organizationId, year),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.calendarYear.created,
      entity: { type: "calendarYear", id: String(year) },
      after: created,
    });
    return created;
  });
}
