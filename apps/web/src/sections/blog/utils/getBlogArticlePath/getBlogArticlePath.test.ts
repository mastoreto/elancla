import { describe, expect, test } from 'bun:test';
import { getBlogArticlePath, toUrlDate } from './getBlogArticlePath';

describe('getBlogArticlePath', () => {
  test('puts the url date and the slug in the path', () => {
    expect(getBlogArticlePath({ urlDate: '2026-04-29', slug: 'mi-post' })).toBe(
      '/blog/2026/04/29/mi-post'
    );
  });
});

describe('toUrlDate', () => {
  test('joins the route params back into a url date', () => {
    expect(toUrlDate('2026', '04', '29')).toBe('2026-04-29');
  });

  test('missing params never match a real date', () => {
    expect(toUrlDate(undefined, '04', '29')).not.toMatch(/^\d{4}-/);
  });
});
