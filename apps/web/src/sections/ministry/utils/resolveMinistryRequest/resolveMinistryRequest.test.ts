import { describe, expect, test } from 'bun:test';
import type { PublicMinistry } from '@ancla/content';
import {
  normalizeMinistrySlug,
  resolveMinistryRequest,
} from './resolveMinistryRequest';

const SITE = 'https://example.org';
const TEACHING = {
  slug: 'ensenanza',
  locale: 'es',
  alternates: { es: 'ensenanza', en: 'teaching' },
} as PublicMinistry;
const TEACHING_EN = {
  slug: 'teaching',
  locale: 'en',
  alternates: { es: 'ensenanza', en: 'teaching' },
} as PublicMinistry;

const load = async (slug: string, locale: string) => {
  if (slug === 'ensenanza' || slug === 'teaching') {
    return locale === 'en' ? TEACHING_EN : TEACHING;
  }
  return null;
};

describe('normalizeMinistrySlug', () => {
  test('drops accents and capitals', () => {
    expect(normalizeMinistrySlug('Enseñanza')).toBe('ensenanza');
    expect(normalizeMinistrySlug('JÓVENES')).toBe('jovenes');
  });
});

describe('resolveMinistryRequest', () => {
  test('the canonical slug is the page, with hreflang from the alternates', async () => {
    const result = await resolveMinistryRequest({
      slug: 'ensenanza',
      locale: 'es',
      siteUrl: SITE,
      load,
    });
    expect(result.kind).toBe('page');
    if (result.kind !== 'page') return;
    expect(result.meta.canonical).toBe(
      'https://example.org/ministerios/ensenanza'
    );
    expect(result.meta.noindex).toBe(false);
  });

  test('an old accented URL redirects to the canonical slug', async () => {
    expect(
      await resolveMinistryRequest({
        slug: 'enseñanza',
        locale: 'es',
        siteUrl: SITE,
        load,
      })
    ).toEqual({ kind: 'redirect', location: '/ministerios/ensenanza' });
  });

  test('capitals redirect too', async () => {
    expect(
      await resolveMinistryRequest({
        slug: 'Ensenanza',
        locale: 'es',
        siteUrl: SITE,
        load,
      })
    ).toEqual({ kind: 'redirect', location: '/ministerios/ensenanza' });
  });

  test('the slug of another language redirects to the one of the language asked', async () => {
    expect(
      await resolveMinistryRequest({
        slug: 'ensenanza',
        locale: 'en',
        siteUrl: SITE,
        load,
      })
    ).toEqual({ kind: 'redirect', location: '/en/ministerios/teaching' });
  });

  test('an unknown ministry is not found', async () => {
    expect(
      await resolveMinistryRequest({
        slug: 'nope',
        locale: 'es',
        siteUrl: SITE,
        load,
      })
    ).toEqual({ kind: 'notFound' });
  });
});
