import { describe, expect, test } from 'bun:test';
import type { CalendarWeeklySlot } from 'src/sections/calendar/types';
import {
  columnOfWeekday,
  SUNDAY_COLUMN,
  sortWeekly,
  weekdayOfColumn,
  weeklyOfColumn,
} from './weeklyColumns';

function slot(weekday: number, start: string): CalendarWeeklySlot {
  return {
    weekday,
    start,
    title: `${weekday}-${start}`,
    ministries: [],
    color: 'obra-red',
  };
}

describe('weeklyColumns', () => {
  test('maps Sunday-first weekdays to Monday-first columns and back', () => {
    expect(columnOfWeekday(1)).toBe(0);
    expect(columnOfWeekday(6)).toBe(5);
    expect(columnOfWeekday(0)).toBe(SUNDAY_COLUMN);
    for (let column = 0; column < 7; column += 1) {
      expect(columnOfWeekday(weekdayOfColumn(column))).toBe(column);
    }
  });

  test('sorts Monday first, Sunday last, then by time', () => {
    const sorted = sortWeekly([
      slot(0, '11:15'),
      slot(3, '20:00'),
      slot(0, '10:00'),
      slot(1, '19:30'),
    ]);
    expect(sorted.map((item) => item.title)).toEqual([
      '1-19:30',
      '3-20:00',
      '0-10:00',
      '0-11:15',
    ]);
  });

  test('picks the slots of a column', () => {
    const weekly = [slot(0, '11:15'), slot(0, '10:00'), slot(2, '20:00')];
    expect(weeklyOfColumn(weekly, SUNDAY_COLUMN).map((s) => s.start)).toEqual([
      '10:00',
      '11:15',
    ]);
    expect(weeklyOfColumn(weekly, 0)).toEqual([]);
  });
});
