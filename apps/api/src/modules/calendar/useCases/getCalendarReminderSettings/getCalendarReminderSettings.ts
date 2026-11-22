import type { CalendarReminderSettingsDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { findReminderSettingsRow } from "../../data";
import { toReminderSettingsDto } from "../../mappers";

export async function getCalendarReminderSettings(
  organizationId: string,
): Promise<CalendarReminderSettingsDto> {
  return toReminderSettingsDto(
    await findReminderSettingsRow(db, organizationId),
  );
}
