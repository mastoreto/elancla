import { z } from "zod";
import {
  ACTIVITY_MINISTRIES_MAX_COUNT,
  ACTIVITY_TITLE_MAX_LENGTH,
  calendarYearNumber,
  SERVICE_KINDS,
  timeOfDay,
  translationsOf,
  versionField,
  weekdayNumber,
} from "./calendarConstants";

const activityTranslationDto = z.strictObject({
  title: z.string().trim().min(1).max(ACTIVITY_TITLE_MAX_LENGTH),
});

const serviceKind = z.enum(SERVICE_KINDS);

export const recurringActivityDto = z.strictObject({
  id: z.uuid(),
  scheduleSetId: z.uuid(),
  weekday: weekdayNumber,
  start: timeOfDay,
  end: timeOfDay.nullable(),
  placeId: z.uuid().nullable(),
  /** Not null means "this is a worship time" (feeds the service times of the site). */
  serviceKind: serviceKind.nullable(),
  isPublic: z.boolean(),
  /** Fixed activities repeat every year; the others belong to `year`. */
  isFixed: z.boolean(),
  year: z.number().int().nullable(),
  /** Fixed activities only: someone has to confirm them every year. */
  annualReview: z.boolean(),
  needsReview: z.boolean(),
  ministryIds: z.array(z.uuid()),
  version: z.number().int(),
  translations: z.record(z.string(), activityTranslationDto),
});
export type RecurringActivityDto = z.infer<typeof recurringActivityDto>;

export const recurringActivityListDto = z.strictObject({
  items: z.array(recurringActivityDto),
});
export type RecurringActivityListDto = z.infer<typeof recurringActivityListDto>;

export const recurringActivityListQuery = z.object({
  scheduleSetId: z.uuid().optional(),
});

const activityFields = {
  scheduleSetId: z.uuid(),
  weekday: weekdayNumber,
  start: timeOfDay,
  end: timeOfDay.nullable(),
  placeId: z.uuid().nullable(),
  serviceKind: serviceKind.nullable(),
  isPublic: z.boolean(),
  /** `null` makes the activity fixed; a year ties it to that calendar year. */
  year: calendarYearNumber.nullable(),
  annualReview: z.boolean(),
  ministryIds: z.array(z.uuid()).max(ACTIVITY_MINISTRIES_MAX_COUNT),
  translations: translationsOf(activityTranslationDto),
};

type ActivityRules = {
  start: string;
  end: string | null;
  year: number | null;
  annualReview: boolean;
};

const endIsAfterStart = ({ start, end }: ActivityRules): boolean =>
  end === null || end > start;
const annualReviewIsFixed = ({ year, annualReview }: ActivityRules): boolean =>
  !annualReview || year === null;

/** Create body. `isFixed` is derived: it is `year === null`. */
export const upsertRecurringActivityBody = z
  .strictObject(activityFields)
  .refine(endIsAfterStart, {
    path: ["end"],
    message: "end must be after start",
  })
  .refine(annualReviewIsFixed, {
    path: ["annualReview"],
    message: "Only fixed activities (without a year) are reviewed every year",
  });
export type UpsertRecurringActivityBody = z.infer<
  typeof upsertRecurringActivityBody
>;

/** PATCH body: the same fields plus the `version` read (409 `stale_version`). */
export const updateRecurringActivityBody = z
  .strictObject({ ...activityFields, version: versionField })
  .refine(endIsAfterStart, {
    path: ["end"],
    message: "end must be after start",
  })
  .refine(annualReviewIsFixed, {
    path: ["annualReview"],
    message: "Only fixed activities (without a year) are reviewed every year",
  });
export type UpdateRecurringActivityBody = z.infer<
  typeof updateRecurringActivityBody
>;
