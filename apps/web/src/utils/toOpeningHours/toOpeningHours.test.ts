import { describe, expect, test } from 'bun:test';
import { toOpeningHours } from './toOpeningHours';

describe('toOpeningHours', () => {
  test('formats worship slots for JSON-LD and skips the rest', () => {
    expect(
      toOpeningHours([
        { kind: 'worship', weekday: 0, start: '11:15', end: '13:00' },
        { kind: 'bibleSchool', weekday: 0, start: '10:00', end: null },
        { kind: 'worship', weekday: 3, start: '19:00', end: null },
      ])
    ).toEqual(['Su 11:15-13:00', 'We 19:00']);
  });

  test('is empty without worship slots', () => {
    expect(toOpeningHours([])).toEqual([]);
  });
});
