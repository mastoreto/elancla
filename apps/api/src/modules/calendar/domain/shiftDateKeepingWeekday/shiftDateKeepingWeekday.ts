import { addDays, formatDateOnly, parseDateOnly, weekdayOf } from "../dateOnly";

const DAYS_PER_WEEK = 7;
/** Farthest a date moves to land on the same weekday: three days either way, never more. */
const HALF_WEEK = 3;

const pad = (year: number): string => String(year).padStart(4, "0");

/**
 * The same month and day in another year: 29 February lands on 28 February when the target year
 * has no leap day. This is what "keep the exact date" means when copying a year.
 */
export function moveDateToYear(date: string, toYear: number): string {
  const candidate = `${pad(toYear)}-${date.slice(5)}`;
  const exists = formatDateOnly(parseDateOnly(candidate)) === candidate;
  return exists ? candidate : `${pad(toYear)}-02-28`;
}

/** Days (−3…+3) to add to `from` to reach the closest date that falls on `weekday`. */
function distanceToWeekday(from: string, weekday: number): number {
  const ahead = (weekday - weekdayOf(from) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  return ahead <= HALF_WEEK ? ahead : ahead - DAYS_PER_WEEK;
}

/**
 * Moves an event date to another year keeping its weekday (D-31): the same month and day in the
 * target year, then the closest date with the weekday the original had. Two dates are never
 * equally close (a week has an odd number of days), so there is no tie to break. The result stays
 * inside the target year: when the closest date would fall in the neighbouring year, the nearest
 * one inside it is used, so the copied event still belongs to the year it was copied into.
 */
export function shiftDateKeepingWeekday(date: string, toYear: number): string {
  const sameDay = moveDateToYear(date, toYear);
  const shifted = addDays(sameDay, distanceToWeekday(sameDay, weekdayOf(date)));
  if (shifted < `${pad(toYear)}-01-01`) return addDays(shifted, DAYS_PER_WEEK);
  if (shifted > `${pad(toYear)}-12-31`) return addDays(shifted, -DAYS_PER_WEEK);
  return shifted;
}
