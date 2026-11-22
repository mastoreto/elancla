import type { ScheduleExceptionDto } from "@ancla/contracts";
import type { ScheduleExceptionRow } from "../../data";
import { formatDateOnly } from "../../domain";

export function toScheduleExceptionDto(
  row: ScheduleExceptionRow,
): ScheduleExceptionDto {
  return {
    id: row.id,
    date: formatDateOnly(row.date),
    replacementSetId: row.replacementSetId,
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, message }) => [locale, { message }]),
    ),
  };
}
