import {
  type CalendarReminderSettingsDto,
  REMINDER_RECIPIENTS_MAX_COUNT,
  type UpdateCalendarReminderSettingsBody,
} from "@ancla/contracts";
import type { KnownRecipients, ReminderFormValues } from "../../types";

export interface ReminderFormErrors {
  recipientRoleIds?: string;
  recipientUserIds?: string;
}

/** Keeps only the ids that are still on offer; with no list to compare against, keeps them all. */
function keepKnown(ids: readonly string[], known: readonly string[] | null): string[] {
  return known === null ? [...ids] : ids.filter((id) => known.includes(id));
}

/** Form values from the saved recipients, dropping roles and users that no longer exist. */
export function toReminderFormValues(
  settings: Pick<CalendarReminderSettingsDto, "recipientRoleIds" | "recipientUserIds">,
  known: KnownRecipients,
): ReminderFormValues {
  return {
    recipientRoleIds: keepKnown(settings.recipientRoleIds, known.roleIds),
    recipientUserIds: keepKnown(settings.recipientUserIds, known.userIds),
  };
}

/** The `PUT /content/calendar/reminders` body; a role or user listed twice is sent once. */
export function toReminderBody(values: ReminderFormValues): UpdateCalendarReminderSettingsBody {
  return {
    recipientRoleIds: [...new Set(values.recipientRoleIds)],
    recipientUserIds: [...new Set(values.recipientUserIds)],
  };
}

function tooMany(ids: readonly string[], noun: string): string | undefined {
  return ids.length > REMINDER_RECIPIENTS_MAX_COUNT
    ? `Elige hasta ${REMINDER_RECIPIENTS_MAX_COUNT} ${noun}.`
    : undefined;
}

/** The limits of the contract, so the form says so before the API answers 400. */
export function validateReminderForm(values: ReminderFormValues): ReminderFormErrors {
  return {
    recipientRoleIds: tooMany(values.recipientRoleIds, "roles"),
    recipientUserIds: tooMany(values.recipientUserIds, "personas"),
  };
}

/** Whether the saved recipients and the form differ, ignoring the order of the ids. */
export function reminderFormChanged(
  saved: ReminderFormValues,
  current: ReminderFormValues,
): boolean {
  const differs = (left: readonly string[], right: readonly string[]): boolean =>
    left.length !== right.length || left.some((id) => !right.includes(id));
  return (
    differs(saved.recipientRoleIds, current.recipientRoleIds) ||
    differs(saved.recipientUserIds, current.recipientUserIds)
  );
}
