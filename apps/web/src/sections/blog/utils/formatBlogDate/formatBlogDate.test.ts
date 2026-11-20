import { describe, expect, test } from 'bun:test';
import { formatBlogDate } from './formatBlogDate';

describe('formatBlogDate', () => {
  test('full: day, month and year in capitals', () => {
    expect(formatBlogDate('2026-11-17', 'es')).toBe('17 · NOV · 2026');
  });

  test('compact leaves the year out', () => {
    expect(formatBlogDate('2026-04-29', 'es', 'compact')).toBe('29 · ABR');
  });

  test('uses the month of the language', () => {
    expect(formatBlogDate('2026-04-29', 'en')).toBe('29 · APR · 2026');
    expect(formatBlogDate('2026-02-03', 'pt')).toBe('03 · FEV · 2026');
  });

  test('reads an ISO date-time by its written day, not the local time zone', () => {
    expect(formatBlogDate('2026-04-29T23:59:00.000Z', 'es')).toBe(
      '29 · ABR · 2026'
    );
  });

  test('an invalid date renders nothing', () => {
    expect(formatBlogDate('nope', 'es')).toBe('');
  });
});
