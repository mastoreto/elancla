import { AUDIT_ACTIONS, type CalendarYearDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { EDITORIAL_TYPES, goLiveWorkingRevision } from "../../../editorial";
import { findYearRow, markYearPublished } from "../../data";
import { YearAlreadyPublishedError } from "../../domain";
import { toCalendarYearDto } from "../../mappers";

/**
 * Publishes a calendar year as a whole, in one transaction: the year becomes `PUBLISHED` and the
 * working revision of every event of that year goes live. Publishing the year is the approval, so
 * no review is asked per event; if any event cannot go live (a deleted place, a date outside the
 * year...) nothing is published. Afterwards each event follows the editorial flow on its own.
 */
export function publishCalendarYear(
  ctx: AuthenticatedContext,
  year: number,
): Promise<CalendarYearDto> {
  return withTransaction(db, async (tx) => {
    const current = await findYearRow(tx, ctx.organizationId, year);
    if (!current) throw new NotFoundError("The calendar year was not found");
    if (current.status === "PUBLISHED") throw new YearAlreadyPublishedError();
    const marked = await markYearPublished(tx, {
      organizationId: ctx.organizationId,
      year,
      userId: ctx.user.id,
    });
    if (!marked) throw new YearAlreadyPublishedError();

    // The year is already marked, so the events' own go-live check ("year published") passes.
    const events = await tx.event.findMany({
      where: { organizationId: ctx.organizationId, year },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    let published = 0;
    for (const { id } of events) {
      const wentLive = await goLiveWorkingRevision(
        tx,
        { ctx, definition: EDITORIAL_TYPES.event, entityId: id },
        { calendarYear: year },
      );
      if (wentLive) published += 1;
    }

    const after = await findYearRow(tx, ctx.organizationId, year);
    if (!after) throw new NotFoundError("The calendar year was not found");
    const result = toCalendarYearDto(after);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.calendarYear.published,
      entity: { type: "calendarYear", id: String(year) },
      before: toCalendarYearDto(current),
      after: result,
      metadata: { eventsPublished: published },
    });
    return result;
  });
}
