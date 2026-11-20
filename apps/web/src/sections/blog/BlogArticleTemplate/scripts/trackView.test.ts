import { describe, expect, test } from 'bun:test';
import { hasScrolledHalf } from './trackView';

describe('hasScrolledHalf', () => {
  test('false before half of the scrollable height', () => {
    expect(hasScrolledHalf(100, 2000, 1000)).toBe(false);
  });

  test('true from half of the scrollable height', () => {
    expect(hasScrolledHalf(500, 2000, 1000)).toBe(true);
    expect(hasScrolledHalf(1000, 2000, 1000)).toBe(true);
  });

  test('a page that does not scroll never counts by scroll', () => {
    expect(hasScrolledHalf(0, 800, 800)).toBe(false);
  });
});
