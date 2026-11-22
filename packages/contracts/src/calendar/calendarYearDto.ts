import { z } from "zod";
import {
  CALENDAR_YEAR_STATUSES,
  COPY_YEAR_MAX_ITEMS,
  calendarYearNumber,
} from "./calendarConstants";

export const calendarYearDto = z.strictObject({
  year: z.number().int(),
  status: z.enum(CALENDAR_YEAR_STATUSES),
  publishedAt: z.iso.datetime().nullable(),
  publishedById: z.uuid().nullable(),
});
export type CalendarYearDto = z.infer<typeof calendarYearDto>;

export const calendarYearListDto = z.strictObject({
  items: z.array(calendarYearDto),
});
export type CalendarYearListDto = z.infer<typeof calendarYearListDto>;

/** `POST /content/calendar/years`: a new year always starts as a draft. */
export const createCalendarYearBody = z.strictObject({
  year: calendarYearNumber,
});
export type CreateCalendarYearBody = z.infer<typeof createCalendarYearBody>;

export const calendarYearParams = z.object({
  year: z.coerce.number().int().pipe(calendarYearNumber),
});

/**
 * `POST .../years/:year/copy`: exactly the ids selected in the wizard. The server copies those and
 * nothing else; an id that is not from `fromYear` (or not a copiable kind) is a 400.
 */
export const copyYearBody = z
  .strictObject({
    fromYear: calendarYearNumber,
    activityIds: z.array(z.uuid()).max(COPY_YEAR_MAX_ITEMS),
    eventIds: z.array(z.uuid()).max(COPY_YEAR_MAX_ITEMS),
    /** Copy dates as they are instead of moving them to the same weekday. */
    keepExactDates: z.boolean(),
  })
  .refine(
    ({ activityIds, eventIds }) => activityIds.length + eventIds.length > 0,
    { path: ["activityIds"], message: "Select something to copy" },
  );
export type CopyYearBody = z.infer<typeof copyYearBody>;

export const copyYearResultDto = z.strictObject({
  activities: z.number().int(),
  events: z.number().int(),
});
export type CopyYearResultDto = z.infer<typeof copyYearResultDto>;

/** `POST .../years/:year/reviews`: confirm a fixed activity with annual review for that year. */
export const confirmReviewBody = z.strictObject({ activityId: z.uuid() });
export type ConfirmReviewBody = z.infer<typeof confirmReviewBody>;

export const activityReviewDto = z.strictObject({
  activityId: z.uuid(),
  year: z.number().int(),
  confirmedAt: z.iso.datetime(),
});
export type ActivityReviewDto = z.infer<typeof activityReviewDto>;
