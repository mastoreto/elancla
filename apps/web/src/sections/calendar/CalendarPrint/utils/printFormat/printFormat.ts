import type { CalendarEvent } from 'src/sections/calendar/types';
import { monthName } from 'src/sections/calendar/utils';

// The printed calendar is in Spanish, whatever the visitor's site language.
export const PRINT_LANG = 'es';
const MONTHS_IN_YEAR = 12;

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const MONTHS_ES = Array.from({ length: MONTHS_IN_YEAR }, (_, month) =>
  capitalize(monthName(month, PRINT_LANG, 'long'))
);

const WEEKDAYS = new Intl.DateTimeFormat(PRINT_LANG, {
  weekday: 'short',
  timeZone: 'UTC',
});

/** Short weekday ("sáb") of a `YYYY-MM-DD` date. */
export const weekdayShort = (date: string): string =>
  WEEKDAYS.format(new Date(`${date}T00:00:00Z`)).replace('.', '');

/** A cancelled event has no place on paper. */
export const printableEvents = (events: CalendarEvent[]): CalendarEvent[] =>
  events.filter((event) => event.status === 'scheduled');
