import { describe, expect, test } from 'bun:test';
import type { ServiceTime } from '@ancla/content';
import {
  formatServiceTimeShort,
  formatServiceTimes,
} from './formatServiceTimes';

const WORSHIP: ServiceTime = {
  kind: 'worship',
  weekday: 0,
  start: '11:15',
  end: '13:00',
};
const BIBLE_SCHOOL: ServiceTime = {
  kind: 'bibleSchool',
  weekday: 0,
  start: '10:00',
  end: null,
};

describe('formatServiceTimes', () => {
  test('localizes the weekday and keeps the hours', () => {
    expect(formatServiceTimes([WORSHIP], 'es')).toEqual([
      { kind: 'worship', dayLabel: 'Domingo', timeLabel: '11:15 – 13:00' },
    ]);
    expect(formatServiceTimes([WORSHIP], 'en')[0]?.dayLabel).toBe('Sunday');
    expect(
      formatServiceTimes([{ ...WORSHIP, weekday: 3, end: null }], 'pt')
    ).toEqual([
      { kind: 'worship', dayLabel: 'Quarta-feira', timeLabel: '11:15' },
    ]);
  });

  test('keeps the configured order and kinds', () => {
    const rows = formatServiceTimes([BIBLE_SCHOOL, WORSHIP], 'es');
    expect(rows.map((row) => row.kind)).toEqual(['bibleSchool', 'worship']);
    expect(rows[0]?.timeLabel).toBe('10:00');
  });

  test('is empty without service times', () => {
    expect(formatServiceTimes([], 'es')).toEqual([]);
  });
});

describe('formatServiceTimeShort', () => {
  test('builds the short chip text per locale', () => {
    expect(formatServiceTimeShort(WORSHIP, 'es')).toBe('Dom · 11:15');
    expect(formatServiceTimeShort(WORSHIP, 'en')).toBe('Sun · 11:15');
    expect(formatServiceTimeShort(WORSHIP, 'pt')).toBe('Dom · 11:15');
  });
});
