import { describe, expect, test } from 'bun:test';
import { formatIssue } from './formatIssue';

describe('formatIssue', () => {
  test('pads to three digits', () => {
    expect(formatIssue(3)).toBe('N. 003');
    expect(formatIssue(43)).toBe('N. 043');
  });

  test('keeps a longer number as it is', () => {
    expect(formatIssue(1234)).toBe('N. 1234');
  });
});
