import { urlDate } from "../urlDate";

export const VIEWS_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * First day (`Date` at 00:00 UTC, how a `@db.Date` column is compared) of the "last 30 days"
 * window that ends today in the organization time zone: `day >= viewsWindowStart(...)`.
 */
export function viewsWindowStart(now: Date, timeZone: string): Date {
  const first = new Date(now.getTime() - (VIEWS_WINDOW_DAYS - 1) * DAY_MS);
  return new Date(`${urlDate(first, timeZone)}T00:00:00Z`);
}
