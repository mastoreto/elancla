import {
  getBlogIndex,
  getMinistries,
  getMinistry,
  getPage,
  getPages,
  getPost,
  type SiteConfig,
} from '@ancla/content';
import { getContentPages } from 'src/data/contentPages';
import { defaultLocale, isLocale, type Locale, locales } from 'src/i18n/config';
import { localizePath } from 'src/i18n/utils';
import { getBlogArticlePath } from 'src/sections/blog/utils/getBlogArticlePath';
import { buildSiteTokens } from 'src/utils/siteTokens';
import { withoutOutOfService } from 'src/utils/withoutOutOfService';

export interface SiteIndexEntry {
  /** Locale-free canonical path, e.g. `/confesion-de-fe`. */
  path: string;
  /** Real last-modified date (YYYY-MM-DD); left out when we have no honest one. */
  lastmod?: string;
  /** The languages this entry exists in (`localizedPaths` says where, when the slug changes per language). */
  locales: readonly Locale[];
  title?: string;
  description?: string;
  /** Simple pages, posts and ministries: their slug differs per language, so `path` is the default one. */
  localizedPaths?: Partial<Record<Locale, string>>;
  kind?: 'simplePage' | 'post' | 'ministry';
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

  const tokens = buildSiteTokens(site, defaultLocale);
  for (const page of getContentPages(defaultLocale, tokens)) {
    entries.push({
      path: `/${page.slug}`,
      locales,
      title: page.title,
      description: page.description,
    });
  }

  entries.push(...(await getMinistryEntries()));
  entries.push(...(await getPostEntries()));
  entries.push(...(await getSimplePageEntries()));
  return withoutOutOfService(entries, site.sections, (entry) => entry.path);
}

/**
 * Visible ministries that have a page of their own. The list comes in the default language; each
 * one is asked once more for the slug it has in every language (the SDK caches both, and the
 * sitemap is cached too), so it is listed only in the languages it exists in.
 */
async function getMinistryEntries(): Promise<SiteIndexEntry[]> {
  const { ministries } = await getMinistries(defaultLocale);
  const withPage = ministries.flatMap(({ slug, name }) =>
    slug ? [{ slug, name }] : []
  );
  return Promise.all(
    withPage.map(async ({ slug, name }): Promise<SiteIndexEntry> => {
      const ministry = await getMinistry(slug, defaultLocale);
      const pathOf = (localeSlug: string) => `/ministerios/${localeSlug}`;
      const localizedPaths: Partial<Record<Locale, string>> = {
        [defaultLocale]: pathOf(slug),
      };
      for (const [locale, localeSlug] of Object.entries(
        ministry?.alternates ?? {}
      )) {
        if (isLocale(locale)) localizedPaths[locale] = pathOf(localeSlug);
      }
      return {
        path: pathOf(slug),
        locales: locales.filter((locale) => localizedPaths[locale]),
        localizedPaths,
        title: name,
        description: ministry?.seo.description,
        kind: 'ministry',
      };
    })
  );
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

/**
 * Visible posts. The index comes in the default language; each post is asked once more for the
 * slug it has in every language and the date it was last published (the SDK caches both, and the
 * sitemap is cached too). The date in the URL is the same in every language.
 */
async function getPostEntries(): Promise<SiteIndexEntry[]> {
  const { posts } = await getBlogIndex(defaultLocale);
  return Promise.all(
    posts.map(async (summary): Promise<SiteIndexEntry> => {
      const post = await getPost(summary.slug, defaultLocale);
      const urlDate = post?.urlDate ?? summary.urlDate;
      const pathOf = (slug: string) => getBlogArticlePath({ urlDate, slug });
      const localizedPaths: Partial<Record<Locale, string>> = {
        [defaultLocale]: pathOf(summary.slug),
      };
      for (const [locale, slug] of Object.entries(post?.alternates ?? {})) {
        if (isLocale(locale)) localizedPaths[locale] = pathOf(slug);
      }
      return {
        path: pathOf(summary.slug),
        // The last published revision when the API sends it, else the date shown on the post.
        lastmod: (post?.modifiedAt ?? summary.publishedAt).slice(0, 10),
        locales: locales.filter((locale) => localizedPaths[locale]),
        localizedPaths,
        title: summary.title,
        description: post?.seoDescription ?? summary.excerpt,
        kind: 'post',
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
