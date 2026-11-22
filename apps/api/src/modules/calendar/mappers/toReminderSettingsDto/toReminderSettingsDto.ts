import type { CalendarReminderSettingsDto } from "@ancla/contracts";
import { lastSentOnOf, type ReminderSettingsRow } from "../../data";

/** An organization that never configured the reminders reads as an empty list of recipients. */
export function toReminderSettingsDto(
  row: ReminderSettingsRow | null,
): CalendarReminderSettingsDto {
  return {
    recipientRoleIds: row?.recipientRoleIds ?? [],
    recipientUserIds: row?.recipientUserIds ?? [],
    lastSentOn: lastSentOnOf(row),
  };
}
