import { describe, expect, test } from 'bun:test';
import type { CalendarEvent } from 'src/sections/calendar/types';
import { findNextEvent } from './findNextEvent';

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    uid: 'uid',
    sequence: 0,
    lastModified: '2026-01-01T00:00:00.000Z',
    title: 'Event',
    startDate: '2026-06-01',
    allDay: true,
    ministries: [],
    color: 'obra-red',
    status: 'scheduled',
    ...overrides,
  };
}

describe('findNextEvent', () => {
  test('is the first event from today on, today included', () => {
    const events = [
      event({ title: 'past', startDate: '2026-05-01' }),
      event({ title: 'later', startDate: '2026-07-01' }),
      event({ title: 'today', startDate: '2026-06-10' }),
    ];
    expect(findNextEvent(events, '2026-06-10')?.title).toBe('today');
  });

  test('skips cancelled events', () => {
    const events = [
      event({
        title: 'cancelled',
        startDate: '2026-06-10',
        status: 'cancelled',
      }),
      event({ title: 'kept', startDate: '2026-06-20' }),
    ];
    expect(findNextEvent(events, '2026-06-10')?.title).toBe('kept');
  });

  test('a multi-day event counts until its last day', () => {
    const events = [
      event({ title: 'camp', startDate: '2026-06-08', endDate: '2026-06-12' }),
    ];
    expect(findNextEvent(events, '2026-06-10')?.title).toBe('camp');
    expect(findNextEvent(events, '2026-06-13')).toBeNull();
  });

  test('is null when nothing is left', () => {
    expect(findNextEvent([], '2026-06-10')).toBeNull();
  });
});
