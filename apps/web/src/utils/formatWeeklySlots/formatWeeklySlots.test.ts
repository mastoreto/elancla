import { describe, expect, test } from 'bun:test';
import { formatWeeklySlots } from './formatWeeklySlots';

describe('formatWeeklySlots', () => {
  test('lists the days Monday first, with the end when there is one', () => {
    expect(
      formatWeeklySlots(
        [
          { weekday: 0, start: '10:00' },
          { weekday: 5, start: '20:00', end: '22:00' },
          { weekday: 1, start: '19:00' },
        ],
        'es'
      )
    ).toEqual([
      { dayLabel: 'Lunes', timeLabel: '19:00' },
      { dayLabel: 'Viernes', timeLabel: '20:00 – 22:00' },
      { dayLabel: 'Domingo', timeLabel: '10:00' },
    ]);
  });

  test('orders the slots of one day by start and localizes the day', () => {
    expect(
      formatWeeklySlots(
        [
          { weekday: 6, start: '18:00' },
          { weekday: 6, start: '09:00' },
        ],
        'en'
      ).map((row) => [row.dayLabel, row.timeLabel])
    ).toEqual([
      ['Saturday', '09:00'],
      ['Saturday', '18:00'],
    ]);
  });

  test('no slots, no rows', () => {
    expect(formatWeeklySlots([], 'pt')).toEqual([]);
  });
});
