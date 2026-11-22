import {
  AUDIT_ACTIONS,
  type CopyYearBody,
  type CopyYearResultDto,
  type EventSnapshot,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError, ValidationError } from "../../../../core/errors";
import {
  canSeeEvent,
  createDraftRevision,
  findLiveRevision,
  findWorkingRevision,
} from "../../../editorial";
import {
  copyActivityToYear,
  createCopiedEventRow,
  findYearActivities,
  findYearRow,
  listEventRows,
} from "../../data";
import {
  CopyTargetNotDraftError,
  InvalidCopySelectionError,
  selectCopyItems,
  shiftEventDates,
} from "../../domain";

const FIRST_REVISION_NUMBER = 1;

/** The snapshot an event is copied from: the one being edited, else the one that is live. */
async function findSourceSnapshot(
  tx: Prisma.TransactionClient,
  organizationId: string,
  eventId: string,
): Promise<EventSnapshot | null> {
  const key = {
    organizationId,
    contentType: "EVENT",
    entityId: eventId,
  } as const;
  const revision =
    (await findWorkingRevision(tx, key)) ?? (await findLiveRevision(tx, key));
  return revision ? (revision.snapshot as unknown as EventSnapshot) : null;
}

/**
 * Copies exactly the selected activities and events of an earlier year into a draft year. What is
 * copied is marked `needsReview`; events become new events with a draft revision whose dates moved
 * (same weekday, or the exact date). Fixed activities are never copied: they do not depend on a year.
 */
export async function copyCalendarYear(
  ctx: AuthenticatedContext,
  toYear: number,
  body: CopyYearBody,
): Promise<CopyYearResultDto> {
  const { fromYear, keepExactDates } = body;
  if (fromYear === toYear) {
    throw new ValidationError("The years must be different", [
      { path: "fromYear", message: "Copy from a different year" },
    ]);
  }
  return withTransaction(db, async (tx) => {
    const target = await findYearRow(tx, ctx.organizationId, toYear);
    if (!target) throw new NotFoundError("The calendar year was not found");
    if (target.status !== "DRAFT") throw new CopyTargetNotDraftError();

    const [activities, eventRows] = await Promise.all([
      findYearActivities(tx, ctx.organizationId, fromYear),
      listEventRows(ctx.organizationId, fromYear),
    ]);
    // An internal event the user cannot see is not theirs to copy: it counts as unknown.
    const events = eventRows.filter((row) =>
      canSeeEvent(ctx.access, {
        visibility: row.visibility,
        audienceRoleIds: row.audienceRoles.map(({ roleId }) => roleId),
      }),
    );
    const selection = selectCopyItems({
      fromYear,
      activityIds: body.activityIds,
      eventIds: body.eventIds,
      activities,
      events,
    });
    if (selection.rejectedIds.length > 0) {
      throw new InvalidCopySelectionError(selection.rejectedIds);
    }

    for (const activity of selection.activities) {
      await copyActivityToYear(tx, activity, toYear);
    }
    let copiedEvents = 0;
    for (const source of selection.events) {
      const snapshot = await findSourceSnapshot(
        tx,
        ctx.organizationId,
        source.id,
      );
      // An event nobody ever filled in has nothing to carry over.
      if (!snapshot) continue;
      const copy = await createCopiedEventRow(tx, {
        organizationId: ctx.organizationId,
        year: toYear,
        visibility: source.visibility,
        audienceRoleIds: source.audienceRoles.map(({ roleId }) => roleId),
      });
      await createDraftRevision(tx, {
        key: {
          organizationId: ctx.organizationId,
          contentType: "EVENT",
          entityId: copy.id,
        },
        number: FIRST_REVISION_NUMBER,
        authorId: ctx.user.id,
        snapshot: shiftEventDates({
          snapshot,
          toYear,
          keepExactDates,
        }) as Prisma.InputJsonObject,
      });
      copiedEvents += 1;
    }

    const result = {
      activities: selection.activities.length,
      events: copiedEvents,
    };
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.calendarYear.copied,
      entity: { type: "calendarYear", id: String(toYear) },
      after: result,
      metadata: { fromYear, keepExactDates },
    });
    return result;
  });
}
