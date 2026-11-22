import { addDays, weekdayOf } from "../dateOnly";
import {
  type ResolvableException,
  type ResolvableSet,
  resolveScheduleForDate,
  type ScheduleResolution,
} from "../resolveScheduleForDate";

/** Today and the six days after it: a whole week of hours, whatever day it is today. */
export const WEEK_LENGTH = 7;

export interface ResolvedDay<
  TSet extends ResolvableSet,
  TException extends ResolvableException,
> extends ScheduleResolution<TSet, TException> {
  date: string;
  weekday: number;
}

/** The schedule that governs each of the 7 days from `today` (included). */
export function resolveWeek<
  TSet extends ResolvableSet,
  TException extends ResolvableException,
>(input: {
  today: string;
  sets: readonly TSet[];
  exceptions: readonly TException[];
}): ResolvedDay<TSet, TException>[] {
  const { today, sets, exceptions } = input;
  return Array.from({ length: WEEK_LENGTH }, (_, offset) => {
    const date = addDays(today, offset);
    return {
      date,
      weekday: weekdayOf(date),
      ...resolveScheduleForDate({ date, sets, exceptions }),
    };
  });
}
