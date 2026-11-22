import { z } from "zod";

/*
 * Wall-clock model (D-26): hours are "HH:mm" text and dates are "YYYY-MM-DD" text, both in the
 * church's own time zone (`Organization.timezone`); nothing is converted to UTC.
 * `weekday` follows `Date#getDay` (0 = Sunday), same as the service times of the site settings.
 */

export const SCHEDULE_SET_NAME_MAX_LENGTH = 60;
export const ACTIVITY_TITLE_MAX_LENGTH = 80;
export const EXCEPTION_MESSAGE_MAX_LENGTH = 200;
export const PLACE_NAME_MAX_LENGTH = 80;
export const PLACE_ADDRESS_MAX_LENGTH = 200;
export const PLACE_MAPS_URL_MAX_LENGTH = 300;
export const CALENDAR_ORDER_MAX = 1000;
export const ACTIVITY_MINISTRIES_MAX_COUNT = 6;
export const CALENDAR_YEAR_MIN = 2000;
export const CALENDAR_YEAR_MAX = 2100;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "HH:mm". Compares as text. */
export const timeOfDay = z.string().regex(TIME_PATTERN);

function dateExists(value: string): boolean {
  const [year = 0, month = 0, day = 0] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** "YYYY-MM-DD", and a date that exists (no 2027-02-30). */
export const calendarDate = z
  .string()
  .regex(DATE_PATTERN)
  .refine(dateExists, { message: "Not a valid date" });

export const weekdayNumber = z.number().int().min(0).max(6);

export const calendarYearNumber = z
  .number()
  .int()
  .min(CALENDAR_YEAR_MIN)
  .max(CALENDAR_YEAR_MAX);

/** Lower case on the wire (same words as the site settings); the API maps them to the database enum. */
export const SERVICE_KINDS = ["worship", "bibleSchool"] as const;
export type ServiceKind = (typeof SERVICE_KINDS)[number];

export const EVENT_TITLE_MAX_LENGTH = 120;
export const EVENT_DESCRIPTION_MAX_LENGTH = 1000;
export const EVENT_EXTERNAL_ADDRESS_MAX_LENGTH = 200;
export const EVENT_LINK_URL_MAX_LENGTH = 300;
export const EVENT_MINISTRIES_MAX_COUNT = 6;
export const EVENT_AUDIENCE_ROLES_MAX_COUNT = 50;
/** Most items a single "copy from the previous year" request may carry (per kind). */
export const COPY_YEAR_MAX_ITEMS = 500;

/** Lower case on the wire; the API maps them to the database enums. */
export const EVENT_VISIBILITIES = ["public", "internal"] as const;
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];

export const EVENT_PLACE_MODES = ["place", "tbc", "external"] as const;
export type EventPlaceMode = (typeof EVENT_PLACE_MODES)[number];

export const EVENT_STATUSES = ["scheduled", "cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const CALENDAR_YEAR_STATUSES = ["draft", "published"] as const;
export type CalendarYearStatus = (typeof CALENDAR_YEAR_STATUSES)[number];

/** At least one language; the API checks that the default one is there and the rest are enabled. */
export function translationsOf<Shape extends z.ZodType>(shape: Shape) {
  return z
    .record(z.string(), shape)
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one language is required",
    });
}

/** Shared by every upsert body: the `version` the editor loaded (409 `stale_version`). */
export const versionField = z.number().int().min(1);
