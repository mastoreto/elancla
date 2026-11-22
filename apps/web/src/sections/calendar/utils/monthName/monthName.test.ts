import { describe, expect, test } from 'bun:test';
import { monthName } from './monthName';

describe('monthName', () => {
  test('localizes the month, long and short', () => {
    expect(monthName(0, 'es', 'long')).toBe('enero');
    expect(monthName(11, 'en', 'long')).toBe('December');
    expect(monthName(2, 'pt', 'long')).toBe('março');
    expect(monthName(8, 'es', 'short')).not.toContain('.');
  });
});
