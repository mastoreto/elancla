import { z } from "zod";
import {
  calendarDate,
  EXCEPTION_MESSAGE_MAX_LENGTH,
  translationsOf,
  versionField,
} from "./calendarConstants";

const exceptionTranslationDto = z.strictObject({
  message: z.string().trim().min(1).max(EXCEPTION_MESSAGE_MAX_LENGTH),
});

export const scheduleExceptionDto = z.strictObject({
  id: z.uuid(),
  date: calendarDate,
  /** The set that replaces the regular one that day; `null` means "no meeting". */
  replacementSetId: z.uuid().nullable(),
  version: z.number().int(),
  translations: z.record(z.string(), exceptionTranslationDto),
});
export type ScheduleExceptionDto = z.infer<typeof scheduleExceptionDto>;

export const scheduleExceptionListDto = z.strictObject({
  items: z.array(scheduleExceptionDto),
});
export type ScheduleExceptionListDto = z.infer<typeof scheduleExceptionListDto>;

const exceptionFields = {
  date: calendarDate,
  replacementSetId: z.uuid().nullable(),
  translations: translationsOf(exceptionTranslationDto),
};

/** Create body. One exception per date (409 `exception_date_taken`). */
export const upsertScheduleExceptionBody = z.strictObject(exceptionFields);
export type UpsertScheduleExceptionBody = z.infer<
  typeof upsertScheduleExceptionBody
>;

/** PATCH body: the same fields plus the `version` read (409 `stale_version`). */
export const updateScheduleExceptionBody = z.strictObject({
  ...exceptionFields,
  version: versionField,
});
export type UpdateScheduleExceptionBody = z.infer<
  typeof updateScheduleExceptionBody
>;
