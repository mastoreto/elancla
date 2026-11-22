import type { ScheduleException, ScheduleSet } from "@ancla/db";
import {
  formatDateOnly,
  type ResolvableException,
  type ResolvableSet,
} from "../../domain";

const dateOrNull = (value: Date | null): string | null =>
  value === null ? null : formatDateOnly(value);

/** A schedule set row as the pure resolution reads it (dates as "YYYY-MM-DD"). */
export function toResolvableSet(row: ScheduleSet): ResolvableSet {
  return {
    id: row.id,
    validFrom: dateOrNull(row.validFrom),
    validTo: dateOrNull(row.validTo),
    isDefault: row.isDefault,
    forcedActive: row.forcedActive,
  };
}

export function toResolvableException(
  row: ScheduleException,
): ResolvableException {
  return {
    date: formatDateOnly(row.date),
    replacementSetId: row.replacementSetId,
  };
}
