import { z } from "zod";
import {
  CALENDAR_ORDER_MAX,
  calendarDate,
  SCHEDULE_SET_NAME_MAX_LENGTH,
  translationsOf,
  versionField,
} from "./calendarConstants";

const scheduleSetTranslationDto = z.strictObject({
  name: z.string().trim().min(1).max(SCHEDULE_SET_NAME_MAX_LENGTH),
});

export const scheduleSetDto = z.strictObject({
  id: z.uuid(),
  validFrom: calendarDate.nullable(),
  validTo: calendarDate.nullable(),
  /** The set used when nothing else applies; only one per church. */
  isDefault: z.boolean(),
  /** The manual switch: while on, this set wins over the validity windows; only one at a time. */
  forcedActive: z.boolean(),
  order: z.number().int(),
  version: z.number().int(),
  translations: z.record(z.string(), scheduleSetTranslationDto),
});
export type ScheduleSetDto = z.infer<typeof scheduleSetDto>;

export const scheduleSetListDto = z.strictObject({
  items: z.array(scheduleSetDto),
});
export type ScheduleSetListDto = z.infer<typeof scheduleSetListDto>;

const setFields = {
  validFrom: calendarDate.nullable(),
  validTo: calendarDate.nullable(),
  isDefault: z.boolean(),
  forcedActive: z.boolean(),
  order: z.number().int().min(0).max(CALENDAR_ORDER_MAX),
  translations: translationsOf(scheduleSetTranslationDto),
};

const windowIsOrdered = ({
  validFrom,
  validTo,
}: {
  validFrom: string | null;
  validTo: string | null;
}): boolean => validFrom === null || validTo === null || validTo >= validFrom;
const WINDOW_ISSUE = {
  path: ["validTo"],
  message: "validTo must not be before validFrom",
};

/**
 * Create body. Turning `isDefault` or `forcedActive` on moves the flag from the set that had it,
 * so a church never ends up with two.
 */
export const upsertScheduleSetBody = z
  .strictObject(setFields)
  .refine(windowIsOrdered, WINDOW_ISSUE);
export type UpsertScheduleSetBody = z.infer<typeof upsertScheduleSetBody>;

/** PATCH body: the same fields plus the `version` read (409 `stale_version`). */
export const updateScheduleSetBody = z
  .strictObject({ ...setFields, version: versionField })
  .refine(windowIsOrdered, WINDOW_ISSUE);
export type UpdateScheduleSetBody = z.infer<typeof updateScheduleSetBody>;
