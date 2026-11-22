import type { EventSnapshot } from "@ancla/contracts";
import { addDays, parseDateOnly } from "../dateOnly";
import {
  moveDateToYear,
  shiftDateKeepingWeekday,
} from "../shiftDateKeepingWeekday";

const MS_PER_DAY = 86_400_000;

const daysBetween = (from: string, to: string): number =>
  Math.round(
    (parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) / MS_PER_DAY,
  );

/**
 * The snapshot of an event copied into another year: the start date moves (to the same weekday, or
 * to the same day of the month when `keepExactDates`), a multi-day event keeps its length, and a
 * cancelled event comes back scheduled: last year's cancellation says nothing about this one.
 */
export function shiftEventDates(input: {
  snapshot: EventSnapshot;
  toYear: number;
  keepExactDates: boolean;
}): EventSnapshot {
  const { snapshot, toYear, keepExactDates } = input;
  const startDate = keepExactDates
    ? moveDateToYear(snapshot.startDate, toYear)
    : shiftDateKeepingWeekday(snapshot.startDate, toYear);
  const { endDate: sourceEndDate, ...rest } = snapshot;
  return {
    ...rest,
    startDate,
    ...(sourceEndDate
      ? {
          endDate: addDays(
            startDate,
            daysBetween(snapshot.startDate, sourceEndDate),
          ),
        }
      : {}),
    status: "scheduled",
  };
}
