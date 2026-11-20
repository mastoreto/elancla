import {
  getAllPostsFull,
  getPage,
  getPages,
  isSeedArticle,
  type SiteConfig,
} from '@ancla/content';
import { getContentPages } from 'src/data/contentPages';
import { defaultLocale, isLocale, type Locale, locales } from 'src/i18n/config';
import { localizePath } from 'src/i18n/utils';
import { buildSiteTokens } from 'src/utils/siteTokens';
import { withoutOutOfService } from 'src/utils/withoutOutOfService';

export interface SiteIndexEntry {
  /** Locale-free canonical path, e.g. `/confesion-de-fe`. */
  path: string;
  /** Real last-modified date (YYYY-MM-DD); left out when we have no honest one. */
  lastmod?: string;
  /** `all`: es/pt/en versions exist. `es`: Spanish only (the blog is not translated). */
  locales: readonly Locale[];
  title?: string;
  description?: string;
  /** Simple pages: their slug differs per language, so `path` is the default one. */
  localizedPaths?: Partial<Record<Locale, string>>;
  kind?: 'simplePage';
}

/** Pages that exist in every locale and are not content pages. */
const STATIC_PATHS = [
  '/',
  '/visitanos',
  '/confesion-de-fe',
  '/sermones',
  '/calendario-anual',
  '/blog',
];

/**
 * Single list of indexable URLs; the sitemap and the llms files both read it. Sections taken out
 * of service are left out.
 */
export async function getSiteIndex(
  site: SiteConfig
): Promise<SiteIndexEntry[]> {
  const entries: SiteIndexEntry[] = STATIC_PATHS.map((path) => ({
    path,
    locales,
  }));

  // Aliases (ñ → n slugs) are noindex duplicates, so only `page.slug` is listed.
  const tokens = buildSiteTokens(site, defaultLocale);
  for (const page of getContentPages(defaultLocale, tokens)) {
    const path =
      page.routeGroup === 'ministerios'
        ? `/ministerios/${page.slug}`
        : `/${page.slug}`;
    entries.push({
      path,
      locales,
      title: page.title,
      description: page.description,
    });
  }

  for (const post of await getAllPostsFull()) {
    if (isSeedArticle(post)) continue;
    entries.push({
      path: `/blog/${post.year}/${post.month}/${post.day}/${post.slug}`,
      lastmod: post.publishedAt,
      locales: [defaultLocale],
      title: post.title,
      description: post.description,
    });
  }
  entries.push(...(await getSimplePageEntries()));
  return withoutOutOfService(entries, site.sections, (entry) => entry.path);
}

/**
 * Published simple pages. The list comes in the default language; each page is asked once more
 * for the slug it has in every language (the SDK caches both, and the sitemap is cached too).
 */
async function getSimplePageEntries(): Promise<SiteIndexEntry[]> {
  const summaries = await getPages(defaultLocale);
  return Promise.all(
    summaries.map(async ({ slug, title }): Promise<SiteIndexEntry> => {
      const page = await getPage(slug, defaultLocale);
      const localizedPaths: Partial<Record<Locale, string>> = {
        [defaultLocale]: `/${slug}`,
      };
      for (const [locale, localeSlug] of Object.entries(
        page?.alternates ?? {}
      )) {
        if (isLocale(locale)) localizedPaths[locale] = `/${localeSlug}`;
      }
      return {
        path: `/${slug}`,
        locales: locales.filter((locale) => localizedPaths[locale]),
        localizedPaths,
        title,
        description: page?.seoDescription ?? undefined,
        kind: 'simplePage',
      };
    })
  );
}

export function entryUrls(entry: SiteIndexEntry, siteUrl: string) {
  return entry.locales.map((locale) => ({
    locale,
    url: new URL(
      localizePath(entry.localizedPaths?.[locale] ?? entry.path, locale),
      siteUrl
    ).toString(),
  }));
}
