import { describe, expect, test } from 'bun:test';
import { addDays, compactDate, compactTime } from './isoDate';

describe('isoDate', () => {
  test('adds days across month and year borders', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28');
  });

  test('compacts dates and times', () => {
    expect(compactDate('2026-05-08')).toBe('20260508');
    expect(compactTime('09:30')).toBe('093000');
  });
});
