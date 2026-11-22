import { describe, expect, test } from 'bun:test';
import { monthLayout } from './monthLayout';

describe('monthLayout', () => {
  test('counts the blank cells of a Monday-first grid', () => {
    // 2027-01-01 is a Friday: four blanks (Mon..Thu).
    expect(monthLayout(2027, 0)).toEqual({ lead: 4, days: 31 });
    // 2026-06-01 is a Monday: no blanks.
    expect(monthLayout(2026, 5)).toEqual({ lead: 0, days: 30 });
    // 2026-02-01 is a Sunday: six blanks.
    expect(monthLayout(2026, 1)).toEqual({ lead: 6, days: 28 });
  });

  test('knows leap years', () => {
    expect(monthLayout(2028, 1).days).toBe(29);
  });
});
