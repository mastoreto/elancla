import { describe, expect, test } from 'bun:test';
import type { CalendarEvent } from 'src/sections/calendar/types';
import { eventWhenLabel } from './eventWhenLabel';

const OPTIONS = { lang: 'es', allDayLabel: 'Todo el día', timeSuffix: 'h' };

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    uid: 'uid',
    sequence: 0,
    lastModified: '2026-01-01T00:00:00.000Z',
    title: 'Event',
    startDate: '2026-03-10',
    allDay: false,
    ministries: [],
    color: 'obra-red',
    status: 'scheduled',
    ...overrides,
  };
}

describe('eventWhenLabel', () => {
  test('shows the start time and the real end when there is one', () => {
    expect(eventWhenLabel(event({ startTime: '11:15' }), OPTIONS)).toBe(
      '11:15 h'
    );
    expect(
      eventWhenLabel(event({ startTime: '10:00', endTime: '12:00' }), OPTIONS)
    ).toBe('10:00–12:00 h');
  });

  test('drops the suffix in languages without one', () => {
    expect(
      eventWhenLabel(event({ startTime: '11:15' }), {
        ...OPTIONS,
        timeSuffix: '',
      })
    ).toBe('11:15');
  });

  test('labels all-day events and multi-day ranges', () => {
    expect(eventWhenLabel(event({ allDay: true }), OPTIONS)).toBe(
      'Todo el día'
    );
    expect(
      eventWhenLabel(event({ allDay: true, endDate: '2026-03-12' }), OPTIONS)
    ).toBe('Todo el día → 12 mar');
  });

  test('is empty with no hours and not all day', () => {
    expect(eventWhenLabel(event({}), OPTIONS)).toBe('');
  });
});
