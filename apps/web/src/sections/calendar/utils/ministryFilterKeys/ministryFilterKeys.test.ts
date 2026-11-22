import { describe, expect, test } from 'bun:test';
import type { CalendarMinistry } from 'src/sections/calendar/types';
import { ministryFilterKeys } from './ministryFilterKeys';

const MINISTRIES: CalendarMinistry[] = [
  { name: 'Alabanza', color: 'obra-red' },
  { name: 'Jóvenes', slug: 'jovenes', color: 'obra-ink' },
  { name: 'Oración', color: 'secondary-300' },
];

describe('ministryFilterKeys', () => {
  test('lists the indexes of the event ministries', () => {
    expect(ministryFilterKeys(['Oración', 'Alabanza'], MINISTRIES)).toBe('2 0');
  });

  test('is empty for the church in general or an unknown name', () => {
    expect(ministryFilterKeys([], MINISTRIES)).toBe('');
    expect(ministryFilterKeys(['Otro'], MINISTRIES)).toBe('');
  });
});
