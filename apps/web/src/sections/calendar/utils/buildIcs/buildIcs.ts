import type { PublicCalendar } from '@ancla/content';
import type { CalendarEvent } from 'src/sections/calendar/types';
import { eventLocation } from 'src/sections/calendar/utils/eventPlace';
import {
  addDays,
  compactDate,
  compactTime,
} from 'src/sections/calendar/utils/isoDate';

const CRLF = '\r\n';
// RFC 5545 3.1: a content line is at most 75 octets; the rest continues on a line that starts
// with one space (counted in those 75).
const MAX_LINE_OCTETS = 75;
const ICS_STATUS = { scheduled: 'CONFIRMED', cancelled: 'CANCELLED' } as const;

const encoder = new TextEncoder();

/** RFC 5545 3.3.11: backslash, semicolon, comma and line breaks are escaped in text values. */
function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Splits a content line at 75 octets without cutting a multi-byte character. */
function foldLine(line: string): string[] {
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) return [line];
  const lines: string[] = [];
  let current = '';
  let octets = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (octets + size > MAX_LINE_OCTETS) {
      lines.push(current);
      current = ' ';
      octets = 1;
    }
    current += character;
    octets += size;
  }
  lines.push(current);
  return lines;
}

/** `2026-01-05T14:30:00.000Z` -> `20260105T143000Z`. */
function utcStamp(instant: string): string {
  return new Date(instant)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** DTSTART / DTEND lines: dates for all day events, wall-clock hours in the church zone otherwise. */
function dateLines(event: CalendarEvent, timezone: string): string[] {
  const lastDate = event.endDate ?? event.startDate;
  if (event.allDay || !event.startTime) {
    return [
      `DTSTART;VALUE=DATE:${compactDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${compactDate(addDays(lastDate, 1))}`,
    ];
  }
  const lines = [
    `DTSTART;TZID=${timezone}:${compactDate(event.startDate)}T${compactTime(event.startTime)}`,
  ];
  // No end time means no end: nothing is invented.
  if (event.endTime) {
    lines.push(
      `DTEND;TZID=${timezone}:${compactDate(lastDate)}T${compactTime(event.endTime)}`
    );
  }
  return lines;
}

function eventLines(
  event: CalendarEvent,
  timezone: string,
  host: string
): string[] {
  const stamp = utcStamp(event.lastModified);
  const location = eventLocation(event.place);
  return [
    'BEGIN:VEVENT',
    `UID:${event.uid}@${host}`,
    `SEQUENCE:${event.sequence}`,
    `DTSTAMP:${stamp}`,
    `LAST-MODIFIED:${stamp}`,
    ...dateLines(event, timezone),
    `SUMMARY:${escapeText(event.title)}`,
    ...(event.description
      ? [`DESCRIPTION:${escapeText(event.description)}`]
      : []),
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    ...(event.linkUrl ? [`URL:${event.linkUrl}`] : []),
    `STATUS:${ICS_STATUS[event.status]}`,
    'END:VEVENT',
  ];
}

/**
 * The subscription feed (`.ics`) of the public events of a calendar year. Pure: the same calendar
 * gives the same text. `UID` is the event's stable uid at `host`, so editing an event updates it in
 * the subscriber's calendar and cancelling it emits `STATUS:CANCELLED`. `calendarName` is the
 * church name shown in the subscriber's calendar list.
 */
export function buildIcs(
  calendar: PublicCalendar,
  host: string,
  calendarName: string
): string {
  const { timezone } = calendar;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeText(calendarName)}//Calendario anual//ES`,
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    `X-WR-TIMEZONE:${timezone}`,
    ...calendar.events.flatMap((event) => eventLines(event, timezone, host)),
    'END:VCALENDAR',
  ];
  return `${lines.flatMap(foldLine).join(CRLF)}${CRLF}`;
}
