import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RESERVED_ROOT_SLUGS, SITE_FALLBACK } from '@ancla/content';
import { getContentPagesByRouteGroup } from 'src/data/contentPages';
import { defaultLocale } from 'src/i18n/config';
import { buildSiteTokens } from 'src/utils/siteTokens';

// A simple page lives at the site root (`/privacidad`), so it must never take a slug that a real
// route or a public file already answers to. RESERVED_ROOT_SLUGS (contracts) is kept by hand;
// this test fails when a route is added to the web and the list is not updated.

const WEB_ROOT = join(import.meta.dir, '..', '..', '..');
const PAGES_DIR = join(WEB_ROOT, 'src', 'pages');
const PUBLIC_DIR = join(WEB_ROOT, 'public');
const SOURCE_EXTENSION = /\.(astro|ts)$/;
// `[locale]` and `[slug]` are the dynamic routes themselves, `index` is the home.
const NOT_A_SLUG = /^(\[.*\]|index)$/;

/** First-level names under `dir`, without the source extension. */
function rootSegments(dir: string, stripExtension: boolean): string[] {
  return readdirSync(dir).map((name) =>
    stripExtension ? name.replace(SOURCE_EXTENSION, '') : name
  );
}

// Files with a dot left (`sitemap.xml`, `favicon.ico`) cannot match a kebab-case slug.
const isSlugLike = (segment: string): boolean =>
  !segment.includes('.') && !NOT_A_SLUG.test(segment);

describe('RESERVED_ROOT_SLUGS', () => {
  test('covers every first-level route of apps/web/src/pages', () => {
    const missing = rootSegments(PAGES_DIR, true)
      .filter(isSlugLike)
      .filter((segment) => !RESERVED_ROOT_SLUGS.includes(segment));
    expect(missing).toEqual([]);
  });

  test('covers every first-level folder of apps/web/public', () => {
    const missing = rootSegments(PUBLIC_DIR, false)
      .filter(isSlugLike)
      .filter((segment) => !RESERVED_ROOT_SLUGS.includes(segment));
    expect(missing).toEqual([]);
  });

  test('covers the root content pages and their aliases', () => {
    const tokens = buildSiteTokens(SITE_FALLBACK, defaultLocale);
    const slugs = getContentPagesByRouteGroup(
      'root',
      defaultLocale,
      tokens
    ).flatMap((page) => [page.slug, ...(page.aliases ?? [])]);
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs.filter((slug) => !RESERVED_ROOT_SLUGS.includes(slug))).toEqual(
      []
    );
  });
});
