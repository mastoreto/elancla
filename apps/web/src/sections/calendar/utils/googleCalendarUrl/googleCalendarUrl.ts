import type { CalendarEvent } from 'src/sections/calendar/types';
import { eventLocation } from 'src/sections/calendar/utils/eventPlace';
import {
  addDays,
  compactDate,
  compactTime,
} from 'src/sections/calendar/utils/isoDate';

const GOOGLE_CALENDAR_RENDER_URL =
  'https://calendar.google.com/calendar/render';

/** `dates` of the link: all day events end the day after (exclusive); a missing end time is a point in time. */
function googleDates(event: CalendarEvent): string {
  const lastDate = event.endDate ?? event.startDate;
  if (event.allDay || !event.startTime) {
    return `${compactDate(event.startDate)}/${compactDate(addDays(lastDate, 1))}`;
  }
  const start = `${compactDate(event.startDate)}T${compactTime(event.startTime)}`;
  const end = event.endTime
    ? `${compactDate(lastDate)}T${compactTime(event.endTime)}`
    : start;
  return `${start}/${end}`;
}

/** Google Calendar "add event" link; `timezone` is the church's, so the hours mean the same everywhere. */
export function googleCalendarUrl(
  event: CalendarEvent,
  timezone: string
): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: googleDates(event),
    ctz: timezone,
  });
  const location = eventLocation(event.place);
  if (location) params.set('location', location);
  if (event.description) params.set('details', event.description);
  return `${GOOGLE_CALENDAR_RENDER_URL}?${params}`;
}
