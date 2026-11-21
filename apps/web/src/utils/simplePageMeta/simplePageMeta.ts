import type { PublicPage } from '@ancla/content';
import {
  defaultLocale,
  isLocale,
  type Locale,
  localeMeta,
  locales,
} from 'src/i18n/config';
import { localizePath } from 'src/i18n/utils';

export interface SimplePageMeta {
  canonical: string;
  noindex: boolean;
  languageAlternates: { hrefLang: string; href: string }[];
}

interface Input {
  page: Pick<PublicPage, 'slug' | 'locale' | 'alternates'>;
  /** Language the visitor asked for (the URL prefix). */
  locale: Locale;
  siteUrl: string;
  /** Path the slug hangs from, for pages that are not at the root (`/ministerios`). */
  basePath?: string;
}

/**
 * SEO of a page whose slug changes per language (simple pages, ministries). Its slug changes per language, so hreflang comes from the API's
 * `alternates` instead of reusing one path. When the API fell back to another language, the
 * canonical points at the version that really has that content and the copy is not indexed.
 */
export function buildSimplePageMeta({
  page,
  locale,
  siteUrl,
  basePath = '',
}: Input): SimplePageMeta {
  const served = isLocale(page.locale) ? page.locale : defaultLocale;
  const urlOf = (slug: string, language: Locale): string =>
    new URL(localizePath(`${basePath}/${slug}`, language), siteUrl).toString();

  const languageAlternates = locales.flatMap((language) => {
    const slug = page.alternates[language];
    return slug
      ? [
          {
            hrefLang: localeMeta[language].hreflang,
            href: urlOf(slug, language),
          },
        ]
      : [];
  });
  const defaultSlug = page.alternates[defaultLocale];
  if (defaultSlug) {
    languageAlternates.push({
      hrefLang: 'x-default',
      href: urlOf(defaultSlug, defaultLocale),
    });
  }

  return {
    canonical: urlOf(page.slug, served),
    noindex: served !== locale,
    languageAlternates,
  };
}
