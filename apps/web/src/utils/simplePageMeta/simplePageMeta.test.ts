import { describe, expect, test } from 'bun:test';
import { buildSimplePageMeta } from './simplePageMeta';

const SITE = 'https://example.org';
const PAGE = {
  slug: 'privacidad',
  locale: 'es',
  alternates: { es: 'privacidad', en: 'privacy' },
};

describe('buildSimplePageMeta', () => {
  test('the default language is canonical and indexable', () => {
    const meta = buildSimplePageMeta({
      page: PAGE,
      locale: 'es',
      siteUrl: SITE,
    });
    expect(meta.canonical).toBe('https://example.org/privacidad');
    expect(meta.noindex).toBe(false);
  });

  test('a translated page is canonical at its own localized slug', () => {
    const meta = buildSimplePageMeta({
      page: { ...PAGE, slug: 'privacy', locale: 'en' },
      locale: 'en',
      siteUrl: SITE,
    });
    expect(meta.canonical).toBe('https://example.org/en/privacy');
    expect(meta.noindex).toBe(false);
  });

  test('hreflang lists only the languages the page has, plus x-default', () => {
    const { languageAlternates } = buildSimplePageMeta({
      page: PAGE,
      locale: 'es',
      siteUrl: SITE,
    });
    expect(languageAlternates).toEqual([
      { hrefLang: 'es-UY', href: 'https://example.org/privacidad' },
      { hrefLang: 'en-US', href: 'https://example.org/en/privacy' },
      { hrefLang: 'x-default', href: 'https://example.org/privacidad' },
    ]);
  });

  test('a fallback copy is noindex and canonical to the language it is written in', () => {
    const meta = buildSimplePageMeta({
      page: PAGE,
      locale: 'pt',
      siteUrl: SITE,
    });
    expect(meta.noindex).toBe(true);
    expect(meta.canonical).toBe('https://example.org/privacidad');
  });

  test('ignores alternates for unknown languages', () => {
    const { languageAlternates } = buildSimplePageMeta({
      page: {
        ...PAGE,
        alternates: { es: 'privacidad', fr: 'confidentialite' },
      },
      locale: 'es',
      siteUrl: SITE,
    });
    expect(languageAlternates.map((entry) => entry.hrefLang)).toEqual([
      'es-UY',
      'x-default',
    ]);
  });

  test('pages under a base path keep it in every language', () => {
    const meta = buildSimplePageMeta({
      page: {
        slug: 'worship',
        locale: 'en',
        alternates: { es: 'alabanza', en: 'worship' },
      },
      locale: 'en',
      siteUrl: SITE,
      basePath: '/ministerios',
    });
    expect(meta.canonical).toBe('https://example.org/en/ministerios/worship');
    expect(meta.languageAlternates.map((alternate) => alternate.href)).toEqual([
      'https://example.org/ministerios/alabanza',
      'https://example.org/en/ministerios/worship',
      'https://example.org/ministerios/alabanza',
    ]);
  });
});
