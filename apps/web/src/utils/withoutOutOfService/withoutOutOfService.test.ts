import { describe, expect, test } from 'bun:test';
import { SITE_FALLBACK } from '@ancla/content';
import { withoutOutOfService } from './withoutOutOfService';

const sections = {
  ...SITE_FALLBACK.sections,
  blog: 'outOfService',
  sermons: 'maintenance',
} as const;
const hrefs = [
  '/blog',
  '/sermones#vivo',
  '/nosotros',
  '/#juntos',
  '/en/blog/x',
];

describe('withoutOutOfService', () => {
  test('drops only the entries of sections that are out of service', () => {
    expect(withoutOutOfService(hrefs, sections, (href) => href)).toEqual([
      '/sermones#vivo',
      '/nosotros',
      '/#juntos',
    ]);
  });

  test('keeps everything when every section is active', () => {
    expect(
      withoutOutOfService(hrefs, SITE_FALLBACK.sections, (href) => href)
    ).toEqual(hrefs);
  });
});
