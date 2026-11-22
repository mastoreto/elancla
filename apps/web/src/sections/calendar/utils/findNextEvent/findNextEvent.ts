import type { CalendarEvent } from 'src/sections/calendar/types';
import { sortEventsByStart } from 'src/sections/calendar/utils/groupEventsByMonth';

/**
 * The first scheduled event that has not ended on `today` (local date, "YYYY-MM-DD"); a multi-day
 * event still counts until its last day. Cancelled events are never "next".
 */
export function findNextEvent(
  events: CalendarEvent[],
  today: string
): CalendarEvent | null {
  const upcoming = events.filter(
    (event) =>
      event.status !== 'cancelled' &&
      (event.endDate ?? event.startDate) >= today
  );
  return sortEventsByStart(upcoming)[0] ?? null;
}
