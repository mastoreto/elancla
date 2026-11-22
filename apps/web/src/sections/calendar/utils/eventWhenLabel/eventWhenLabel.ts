import type { CalendarEvent } from 'src/sections/calendar/types';

const TIME_SEPARATOR = '–';
const RANGE_ARROW = '→';

interface EventWhenOptions {
  /** Intl locale tag of the page. */
  lang: string;
  allDayLabel: string;
  /** Appended to the hours ("h"); empty in languages that do not use one. */
  timeSuffix: string;
}

/**
 * "09:30 h", "10:00–12:00 h", "All day", with "→ 12 mar" when the event runs past its first day.
 * Empty when the event has neither hours nor is all day.
 */
export function eventWhenLabel(
  event: CalendarEvent,
  options: EventWhenOptions
): string {
  const { lang, allDayLabel, timeSuffix } = options;
  const suffix = timeSuffix ? ` ${timeSuffix}` : '';
  const hours = event.startTime
    ? `${event.startTime}${event.endTime ? `${TIME_SEPARATOR}${event.endTime}` : ''}${suffix}`
    : '';
  const first = event.allDay ? allDayLabel : hours;
  if (!event.endDate || event.endDate === event.startDate) return first;
  const until = new Intl.DateTimeFormat(lang, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
    .format(new Date(`${event.endDate}T00:00:00Z`))
    .replace('.', '');
  return [first, `${RANGE_ARROW} ${until}`].filter(Boolean).join(' ');
}
