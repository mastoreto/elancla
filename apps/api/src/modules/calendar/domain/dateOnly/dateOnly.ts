/*
 * Calendar dates are "YYYY-MM-DD" text in the church's own time zone. The arithmetic below runs
 * in UTC on purpose: a date without a time has no zone, so there is no daylight saving to trip on.
 */

const MS_PER_DAY = 86_400_000;

/** The `@db.Date` value Prisma expects for a "YYYY-MM-DD" text. */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** "YYYY-MM-DD" of a `@db.Date` value read back from the database. */
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  return formatDateOnly(
    new Date(parseDateOnly(value).getTime() + days * MS_PER_DAY),
  );
}

/** 0 = Sunday, like `Date#getDay`. */
export function weekdayOf(value: string): number {
  return parseDateOnly(value).getUTCDay();
}

export function yearOf(value: string): number {
  return Number(value.slice(0, 4));
}
