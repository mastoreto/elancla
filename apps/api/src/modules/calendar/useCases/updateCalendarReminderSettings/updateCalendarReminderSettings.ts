import {
  AUDIT_ACTIONS,
  type CalendarReminderSettingsDto,
  type UpdateCalendarReminderSettingsBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import {
  findExistingRoleIdsOf,
  findExistingUserIdsOf,
  findReminderSettingsRow,
  upsertReminderSettingsRow,
} from "../../data";
import { InvalidCalendarReferenceError } from "../../domain";
import { toReminderSettingsDto } from "../../mappers";

const unique = (ids: readonly string[]): string[] => [...new Set(ids)];

/** Replaces who gets the reminder emails; every role and user has to exist. */
export function updateCalendarReminderSettings(
  ctx: AuthenticatedContext,
  body: UpdateCalendarReminderSettingsBody,
): Promise<CalendarReminderSettingsDto> {
  const recipientRoleIds = unique(body.recipientRoleIds);
  const recipientUserIds = unique(body.recipientUserIds);
  return withTransaction(db, async (tx) => {
    const knownRoles = await findExistingRoleIdsOf(
      tx,
      ctx.organizationId,
      recipientRoleIds,
    );
    if (knownRoles.length !== recipientRoleIds.length) {
      throw new InvalidCalendarReferenceError(
        "invalid_role",
        "Some recipient roles do not exist",
      );
    }
    const knownUsers = await findExistingUserIdsOf(tx, recipientUserIds);
    if (knownUsers.length !== recipientUserIds.length) {
      throw new InvalidCalendarReferenceError(
        "invalid_user",
        "Some recipient users do not exist",
      );
    }

    const before = toReminderSettingsDto(
      await findReminderSettingsRow(tx, ctx.organizationId),
    );
    const after = toReminderSettingsDto(
      await upsertReminderSettingsRow(tx, ctx.organizationId, {
        recipientRoleIds,
        recipientUserIds,
      }),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.calendarReminder.settingsUpdated,
      entity: { type: "calendarReminderSettings", id: ctx.organizationId },
      before,
      after,
    });
    return after;
  });
}
