import { describe, expect, test } from 'bun:test';
import { localDateIn } from './localDateIn';

describe('localDateIn', () => {
  test('uses the date of the church zone, not UTC', () => {
    // 02:00 UTC on Jan 1 is still Dec 31 in Montevideo (UTC-3).
    const instant = new Date(Date.UTC(2027, 0, 1, 2));
    expect(localDateIn('America/Montevideo', instant)).toBe('2026-12-31');
    expect(localDateIn('UTC', instant)).toBe('2027-01-01');
  });
});
