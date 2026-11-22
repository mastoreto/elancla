import { describe, expect, test } from 'bun:test';
import type { CalendarEvent } from 'src/sections/calendar/types';
import {
  dayOfEvent,
  eventsOfMonth,
  groupEventsByMonth,
} from './groupEventsByMonth';

function eventOn(startDate: string, startTime?: string): CalendarEvent {
  return {
    uid: `uid-${startDate}-${startTime ?? 'all'}`,
    sequence: 0,
    lastModified: '2026-01-01T00:00:00.000Z',
    title: 'Event',
    startDate,
    ...(startTime ? { startTime } : {}),
    allDay: !startTime,
    ministries: [],
    color: 'obra-red',
    status: 'scheduled',
  };
}

describe('groupEventsByMonth', () => {
  test('groups by month in date order and skips empty months', () => {
    const groups = groupEventsByMonth([
      eventOn('2026-05-16', '20:00'),
      eventOn('2026-01-16', '11:15'),
      eventOn('2026-05-08', '19:30'),
    ]);
    expect(groups.map((group) => group.month)).toEqual([0, 4]);
    expect(groups[1]?.events.map((event) => event.startDate)).toEqual([
      '2026-05-08',
      '2026-05-16',
    ]);
  });

  test('orders the same day by start time, all day first', () => {
    const [group] = groupEventsByMonth([
      eventOn('2026-03-01', '18:00'),
      eventOn('2026-03-01'),
      eventOn('2026-03-01', '09:00'),
    ]);
    expect(group?.events.map((event) => event.startTime)).toEqual([
      undefined,
      '09:00',
      '18:00',
    ]);
  });

  test('is empty without events', () => {
    expect(groupEventsByMonth([])).toEqual([]);
  });
});

describe('eventsOfMonth and dayOfEvent', () => {
  test('picks the events that start in the month', () => {
    const events = [eventOn('2026-02-03', '10:00'), eventOn('2026-03-04')];
    expect(eventsOfMonth(events, 1)).toHaveLength(1);
    expect(eventsOfMonth(events, 5)).toEqual([]);
    expect(dayOfEvent(eventOn('2026-03-04'))).toBe(4);
  });
});
