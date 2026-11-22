import type { CalendarEvent } from 'src/sections/calendar/types';

const MONTH_START = 5;
const MONTH_END = 7;

/** Month index (0-11) of the day the event starts. */
export function monthOfEvent(event: CalendarEvent): number {
  return Number(event.startDate.slice(MONTH_START, MONTH_END)) - 1;
}

/** Day of the month the event starts. */
export function dayOfEvent(event: CalendarEvent): number {
  return Number(event.startDate.slice(8));
}

/** Date order, then start time; an event without a time (all day) goes first. */
export function sortEventsByStart(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      (a.startTime ?? '').localeCompare(b.startTime ?? '')
  );
}

/** Events grouped by month index (0-11), in date order; months without events are left out. */
export function groupEventsByMonth(
  events: CalendarEvent[]
): { month: number; events: CalendarEvent[] }[] {
  const byMonth = new Map<number, CalendarEvent[]>();
  for (const event of sortEventsByStart(events)) {
    const month = monthOfEvent(event);
    byMonth.set(month, [...(byMonth.get(month) ?? []), event]);
  }
  return [...byMonth.entries()].map(([month, monthEvents]) => ({
    month,
    events: monthEvents,
  }));
}

/** The events that start in `month` (0-11), in date order. */
export function eventsOfMonth(
  events: CalendarEvent[],
  month: number
): CalendarEvent[] {
  return sortEventsByStart(events).filter(
    (event) => monthOfEvent(event) === month
  );
}
