import { getAllPostsFull, isSeedArticle } from '@ancla/content';
import { getContentPages } from 'src/data/contentPages';
import { defaultLocale, type Locale, locales } from 'src/i18n/config';
import { localizePath } from 'src/i18n/utils';

export interface SiteIndexEntry {
  /** Locale-free canonical path, e.g. `/confesion-de-fe`. */
  path: string;
  /** Real last-modified date (YYYY-MM-DD); left out when we have no honest one. */
  lastmod?: string;
  /** `all`: es/pt/en versions exist. `es`: Spanish only (the blog is not translated). */
  locales: readonly Locale[];
  title?: string;
  description?: string;
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

/** Single list of indexable URLs; the sitemap and the llms files both read it. */
export async function getSiteIndex(): Promise<SiteIndexEntry[]> {
  const entries: SiteIndexEntry[] = STATIC_PATHS.map((path) => ({
    path,
    locales,
  }));

  // Aliases (ñ → n slugs) are noindex duplicates, so only `page.slug` is listed.
  for (const page of getContentPages(defaultLocale)) {
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
  return entries;
}

export function entryUrls(entry: SiteIndexEntry, siteUrl: string) {
  return entry.locales.map((locale) => ({
    locale,
    url: new URL(localizePath(entry.path, locale), siteUrl).toString(),
  }));
}
