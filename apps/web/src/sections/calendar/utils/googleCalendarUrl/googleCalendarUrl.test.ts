import { describe, expect, test } from 'bun:test';
import type { CalendarEvent } from 'src/sections/calendar/types';
import { googleCalendarUrl } from './googleCalendarUrl';

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    uid: 'uid',
    sequence: 0,
    lastModified: '2026-01-01T00:00:00.000Z',
    title: 'Noche de alabanza',
    startDate: '2026-02-20',
    allDay: false,
    ministries: [],
    color: 'obra-red',
    status: 'scheduled',
    ...overrides,
  };
}

function paramsOf(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

describe('googleCalendarUrl', () => {
  test('uses the church time zone and the real end', () => {
    const url = googleCalendarUrl(
      event({
        startTime: '20:00',
        endTime: '22:30',
        place: { name: 'Templo', address: 'Calle 1' },
      }),
      'America/Montevideo'
    );
    const params = paramsOf(url);
    expect(params.get('ctz')).toBe('America/Montevideo');
    expect(params.get('dates')).toBe('20260220T200000/20260220T223000');
    expect(params.get('location')).toBe('Templo, Calle 1');
    expect(params.get('text')).toBe('Noche de alabanza');
  });

  test('does not invent an end when there is none', () => {
    const params = paramsOf(
      googleCalendarUrl(event({ startTime: '20:00' }), 'UTC')
    );
    expect(params.get('dates')).toBe('20260220T200000/20260220T200000');
    expect(params.has('location')).toBe(false);
  });

  test('all day events end the day after, multi-day ones on their last day', () => {
    expect(
      paramsOf(googleCalendarUrl(event({ allDay: true }), 'UTC')).get('dates')
    ).toBe('20260220/20260221');
    expect(
      paramsOf(
        googleCalendarUrl(event({ allDay: true, endDate: '2026-02-22' }), 'UTC')
      ).get('dates')
    ).toBe('20260220/20260223');
  });

  test('a place to be confirmed gives no location', () => {
    expect(
      paramsOf(
        googleCalendarUrl(event({ startTime: '20:00', place: 'tbc' }), 'UTC')
      ).has('location')
    ).toBe(false);
  });
});
