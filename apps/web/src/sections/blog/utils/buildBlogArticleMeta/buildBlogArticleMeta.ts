import type { PublicPost } from '@ancla/content';
import {
  defaultLocale,
  isLocale,
  type Locale,
  localeMeta,
  locales,
} from 'src/i18n/config';
import { localizePath } from 'src/i18n/utils';
import { getBlogArticlePath } from 'src/sections/blog/utils/getBlogArticlePath';

export interface BlogArticleMeta {
  canonical: string;
  noindex: boolean;
  languageAlternates: { hrefLang: string; href: string }[];
}

interface Input {
  post: Pick<PublicPost, 'slug' | 'locale' | 'urlDate' | 'alternates'>;
  /** Language the visitor asked for (the URL prefix). */
  locale: Locale;
  siteUrl: string;
}

/**
 * SEO of a post. Its slug changes per language, so hreflang comes from the API's `alternates`
 * (the date in the path is the same in every language). When the API fell back to another
 * language, the canonical points at the version that really has that content and the copy is not
 * indexed.
 */
export function buildBlogArticleMeta({
  post,
  locale,
  siteUrl,
}: Input): BlogArticleMeta {
  const served = isLocale(post.locale) ? post.locale : defaultLocale;
  const urlOf = (slug: string, language: Locale): string =>
    new URL(
      localizePath(
        getBlogArticlePath({ urlDate: post.urlDate, slug }),
        language
      ),
      siteUrl
    ).toString();

  const languageAlternates = locales.flatMap((language) => {
    const slug = post.alternates[language];
    return slug
      ? [
          {
            hrefLang: localeMeta[language].hreflang,
            href: urlOf(slug, language),
          },
        ]
      : [];
  });
  const defaultSlug = post.alternates[defaultLocale];
  if (defaultSlug) {
    languageAlternates.push({
      hrefLang: 'x-default',
      href: urlOf(defaultSlug, defaultLocale),
    });
  }

  return {
    canonical: urlOf(post.slug, served),
    noindex: served !== locale,
    languageAlternates,
  };
}
