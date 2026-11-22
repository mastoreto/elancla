import { z } from "zod";
import {
  CALENDAR_YEAR_STATUSES,
  calendarDate,
  calendarYearNumber,
  REMINDER_RECIPIENTS_MAX_COUNT,
  weekdayNumber,
} from "./calendarConstants";

export const calendarReminderSettingsDto = z.strictObject({
  recipientRoleIds: z.array(z.uuid()),
  recipientUserIds: z.array(z.uuid()),
  /** Local date of the last reminder the cron job sent, `null` if it never did. */
  lastSentOn: calendarDate.nullable(),
});
export type CalendarReminderSettingsDto = z.infer<
  typeof calendarReminderSettingsDto
>;

/** `PUT /content/calendar/reminders`: who gets the email (a role reaches all its users). */
export const updateCalendarReminderSettingsBody = z.strictObject({
  recipientRoleIds: z.array(z.uuid()).max(REMINDER_RECIPIENTS_MAX_COUNT),
  recipientUserIds: z.array(z.uuid()).max(REMINDER_RECIPIENTS_MAX_COUNT),
});
export type UpdateCalendarReminderSettingsBody = z.infer<
  typeof updateCalendarReminderSettingsBody
>;

const pendingReviewDto = z.strictObject({
  activityId: z.uuid(),
  weekday: weekdayNumber,
  start: z.string(),
  translations: z.record(z.string(), z.strictObject({ title: z.string() })),
});

/** `missing` = the year has not been created yet. */
export const PENDING_YEAR_STATUSES = [
  "missing",
  ...CALENDAR_YEAR_STATUSES,
] as const;
export type PendingYearStatus = (typeof PENDING_YEAR_STATUSES)[number];

/**
 * `GET /content/calendar/pending`: what is left before the year that is about to start can be
 * called done: publishing it and confirming its fixed activities with annual review.
 */
export const calendarPendingDto = z.strictObject({
  year: calendarYearNumber,
  yearStatus: z.enum(PENDING_YEAR_STATUSES),
  pendingReviews: z.array(pendingReviewDto),
  /** The year is not published or there are reviews left. */
  hasPending: z.boolean(),
});
export type CalendarPendingDto = z.infer<typeof calendarPendingDto>;
