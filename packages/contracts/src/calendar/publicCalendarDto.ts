import { z } from "zod";
import { publicBlogImageDto } from "../blog/blogRichText";
import { ministryColor } from "../ministries/ministryDto";
import { publicLocaleQuery } from "../public/publicSiteSettingsDto";
import {
  calendarDate,
  calendarYearNumber,
  EVENT_STATUSES,
  SERVICE_KINDS,
  timeOfDay,
  weekdayNumber,
} from "./calendarConstants";

/*
 * Public calendar contract (`/public/v1`). `.strict()` everywhere: it is public and versioned.
 * Dates are `YYYY-MM-DD` and hours `HH:mm` in the church time zone (`timezone`); `weekday` follows
 * `Date#getDay` (0 = Sunday). The only id that leaves is the stable `uid` of an event, because an
 * iCalendar UID (RFC 5545) must not change when the event is edited.
 */

export const publicCalendarQuery = publicLocaleQuery.extend({
  /** Defaults to the current year in the church time zone. */
  year: z.coerce.number().int().pipe(calendarYearNumber).optional(),
});
export type PublicCalendarQuery = z.infer<typeof publicCalendarQuery>;

/** A ministry of the calendar filters; `slug` only when it has a page of its own. */
export const publicCalendarMinistryDto = z.strictObject({
  name: z.string(),
  slug: z.string().optional(),
  color: ministryColor,
});
export type PublicCalendarMinistryDto = z.infer<
  typeof publicCalendarMinistryDto
>;

export const publicCalendarPlaceDto = z.strictObject({
  name: z.string(),
  address: z.string().optional(),
});
export type PublicCalendarPlaceDto = z.infer<typeof publicCalendarPlaceDto>;

/** A weekly slot. `ministries` are public names, as listed in `ministries`. */
export const publicCalendarWeeklyDto = z.strictObject({
  weekday: weekdayNumber,
  start: timeOfDay,
  end: timeOfDay.optional(),
  title: z.string(),
  place: publicCalendarPlaceDto.optional(),
  ministries: z.array(z.string()),
  /** Color of the first ministry (the default one when it has none). */
  color: ministryColor,
  /** Present when the slot is a worship time. */
  serviceKind: z.enum(SERVICE_KINDS).optional(),
});
export type PublicCalendarWeeklyDto = z.infer<typeof publicCalendarWeeklyDto>;

export const publicCalendarExceptionDto = z.strictObject({
  date: calendarDate,
  message: z.string(),
  /** The church does not meet that day (otherwise another schedule replaces the usual one). */
  noMeeting: z.boolean(),
});
export type PublicCalendarExceptionDto = z.infer<
  typeof publicCalendarExceptionDto
>;

export const publicCalendarEventDto = z.strictObject({
  /** Stable for the life of the event: the iCalendar UID is `<uid>@<host>`. */
  uid: z.string(),
  /** iCalendar SEQUENCE: grows every time the event is published again. */
  sequence: z.number().int(),
  /** When the event was last published (ISO instant): iCalendar LAST-MODIFIED. */
  lastModified: z.iso.datetime(),
  title: z.string(),
  description: z.string().optional(),
  startDate: calendarDate,
  startTime: timeOfDay.optional(),
  endDate: calendarDate.optional(),
  endTime: timeOfDay.optional(),
  allDay: z.boolean(),
  /** A place of the church, the marker `"tbc"` (to be confirmed) or an external address. */
  place: z.union([publicCalendarPlaceDto, z.literal("tbc")]).optional(),
  ministries: z.array(z.string()),
  color: ministryColor,
  image: publicBlogImageDto.optional(),
  linkUrl: z.string().optional(),
  status: z.enum(EVENT_STATUSES),
});
export type PublicCalendarEventDto = z.infer<typeof publicCalendarEventDto>;

/**
 * `GET calendar`: one calendar year. The fixed public activities are always there; the activities of
 * the year and its events only when that year is published (`published`).
 */
export const publicCalendarDto = z.strictObject({
  year: z.number().int(),
  published: z.boolean(),
  timezone: z.string(),
  ministries: z.array(publicCalendarMinistryDto),
  weekly: z.array(publicCalendarWeeklyDto),
  exceptions: z.array(publicCalendarExceptionDto),
  events: z.array(publicCalendarEventDto),
});
export type PublicCalendarDto = z.infer<typeof publicCalendarDto>;
