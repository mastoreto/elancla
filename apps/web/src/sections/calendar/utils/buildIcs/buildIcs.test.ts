import { describe, expect, test } from 'bun:test';
import type { PublicCalendar } from '@ancla/content';
import type { CalendarEvent } from 'src/sections/calendar/types';
import { buildIcs } from './buildIcs';

const HOST = 'elancla.uy';
const NAME = 'Iglesia de prueba';

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    uid: 'a1b2c3',
    sequence: 0,
    lastModified: '2026-03-04T15:30:00.000Z',
    title: 'Noche de alabanza',
    startDate: '2026-02-20',
    startTime: '20:00',
    endTime: '22:00',
    allDay: false,
    ministries: [],
    color: 'obra-red',
    status: 'scheduled',
    ...overrides,
  };
}

function calendarOf(events: CalendarEvent[]): PublicCalendar {
  return {
    year: 2026,
    published: true,
    timezone: 'America/Montevideo',
    ministries: [],
    weekly: [],
    exceptions: [],
    events,
  };
}

const octets = (line: string): number => new TextEncoder().encode(line).length;

describe('buildIcs', () => {
  test('is a calendar with CRLF line ends and the church zone', () => {
    const ics = buildIcs(calendarOf([event()]), HOST, NAME);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
    expect(ics).toContain('X-WR-TIMEZONE:America/Montevideo');
    expect(ics).toContain('X-WR-CALNAME:Iglesia de prueba');
  });

  test('is a valid empty calendar without events', () => {
    const ics = buildIcs(calendarOf([]), HOST, NAME);
    expect(ics).not.toContain('BEGIN:VEVENT');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  test('writes the stable uid, sequence and last modification', () => {
    const ics = buildIcs(calendarOf([event({ sequence: 3 })]), HOST, NAME);
    expect(ics).toContain('UID:a1b2c3@elancla.uy');
    expect(ics).toContain('SEQUENCE:3');
    expect(ics).toContain('DTSTAMP:20260304T153000Z');
    expect(ics).toContain('LAST-MODIFIED:20260304T153000Z');
  });

  test('editing an event keeps its UID and raises its SEQUENCE', () => {
    const before = buildIcs(calendarOf([event()]), HOST, NAME);
    const after = buildIcs(
      calendarOf([event({ title: 'Otro título', sequence: 1 })]),
      HOST,
      NAME
    );
    expect(before).toContain('UID:a1b2c3@elancla.uy');
    expect(after).toContain('UID:a1b2c3@elancla.uy');
    expect(after).toContain('SEQUENCE:1');
  });

  test('emits wall-clock hours in the church zone with the real end', () => {
    const ics = buildIcs(calendarOf([event()]), HOST, NAME);
    expect(ics).toContain('DTSTART;TZID=America/Montevideo:20260220T200000');
    expect(ics).toContain('DTEND;TZID=America/Montevideo:20260220T220000');
  });

  test('does not invent an end when there is none', () => {
    const ics = buildIcs(
      calendarOf([event({ endTime: undefined })]),
      HOST,
      NAME
    );
    expect(ics).toContain('DTSTART;TZID=America/Montevideo:20260220T200000');
    expect(ics).not.toContain('DTEND');
    expect(ics).not.toContain('DURATION');
  });

  test('all day events are dates with an exclusive end', () => {
    const ics = buildIcs(
      calendarOf([
        event({
          allDay: true,
          startTime: undefined,
          endTime: undefined,
          endDate: '2026-02-22',
        }),
      ]),
      HOST,
      NAME
    );
    expect(ics).toContain('DTSTART;VALUE=DATE:20260220');
    expect(ics).toContain('DTEND;VALUE=DATE:20260223');
  });

  test('a cancelled event is STATUS:CANCELLED', () => {
    const ics = buildIcs(
      calendarOf([event({ status: 'cancelled' })]),
      HOST,
      NAME
    );
    expect(ics).toContain('STATUS:CANCELLED');
    expect(ics).not.toContain('STATUS:CONFIRMED');
  });

  test('escapes text and leaves a place to be confirmed empty', () => {
    const ics = buildIcs(
      calendarOf([
        event({
          title: 'Cena; pan, vino \\ más',
          description: 'Línea 1\nLínea 2',
          place: 'tbc',
        }),
      ]),
      HOST,
      NAME
    );
    expect(ics).toContain('SUMMARY:Cena\\; pan\\, vino \\\\ más');
    expect(ics).toContain('DESCRIPTION:Línea 1\\nLínea 2');
    expect(ics).not.toContain('LOCATION');
  });

  test('folds lines at 75 octets without cutting characters', () => {
    const title = `Jornada de oración ${'ñandú '.repeat(30)}`;
    const ics = buildIcs(calendarOf([event({ title })]), HOST, NAME);
    const lines = ics.split('\r\n');
    for (const line of lines) expect(octets(line)).toBeLessThanOrEqual(75);
    // Unfolding gives back the whole title.
    const unfolded = ics.replaceAll('\r\n ', '');
    expect(unfolded).toContain(`SUMMARY:${title}`);
  });

  test('writes the location and link of the event', () => {
    const ics = buildIcs(
      calendarOf([
        event({
          place: { name: 'Templo', address: 'Calle 1' },
          linkUrl: 'https://example.org/evento',
        }),
      ]),
      HOST,
      NAME
    );
    expect(ics).toContain('LOCATION:Templo\\, Calle 1');
    expect(ics).toContain('URL:https://example.org/evento');
  });
});
