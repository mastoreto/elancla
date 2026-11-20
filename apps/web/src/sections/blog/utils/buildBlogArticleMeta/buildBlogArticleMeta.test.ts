import { describe, expect, test } from 'bun:test';
import { buildBlogArticleMeta } from './buildBlogArticleMeta';

const SITE = 'https://example.org';
const POST = {
  slug: 'esperanza',
  locale: 'es',
  urlDate: '2026-04-29',
  alternates: { es: 'esperanza', en: 'hope' },
};

describe('buildBlogArticleMeta', () => {
  test('canonical and hreflang use the slug of each language and the same date', () => {
    const meta = buildBlogArticleMeta({
      post: POST,
      locale: 'es',
      siteUrl: SITE,
    });
    expect(meta.canonical).toBe(
      'https://example.org/blog/2026/04/29/esperanza'
    );
    expect(meta.noindex).toBe(false);
    expect(meta.languageAlternates).toEqual([
      {
        hrefLang: 'es-UY',
        href: 'https://example.org/blog/2026/04/29/esperanza',
      },
      {
        hrefLang: 'en-US',
        href: 'https://example.org/en/blog/2026/04/29/hope',
      },
      {
        hrefLang: 'x-default',
        href: 'https://example.org/blog/2026/04/29/esperanza',
      },
    ]);
  });

  test('the English version is indexed when it is served in English', () => {
    const meta = buildBlogArticleMeta({
      post: { ...POST, slug: 'hope', locale: 'en' },
      locale: 'en',
      siteUrl: SITE,
    });
    expect(meta.canonical).toBe('https://example.org/en/blog/2026/04/29/hope');
    expect(meta.noindex).toBe(false);
  });

  test('a fallback copy points at the language it is written in and is not indexed', () => {
    const meta = buildBlogArticleMeta({
      post: POST,
      locale: 'pt',
      siteUrl: SITE,
    });
    expect(meta.canonical).toBe(
      'https://example.org/blog/2026/04/29/esperanza'
    );
    expect(meta.noindex).toBe(true);
  });
});
