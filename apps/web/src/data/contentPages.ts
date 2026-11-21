import { defaultLocale, type Locale, nonDefaultLocales } from 'src/i18n/config';
import { getMessages } from 'src/i18n/messages';
import { interpolateDeep, localizePath } from 'src/i18n/utils';
import type { SiteTokens } from 'src/utils/siteTokens';

export type ContentPageRouteGroup = 'root';

export interface ContentInlineText {
  text?: string;
  before?: string;
  emphasis?: string;
  after?: string;
}

export interface ContentHeroStat {
  value: string;
  label: string;
}

export interface ContentBreadcrumb {
  label: string;
  href?: string;
}

export interface ContentHero {
  breadcrumbs: ContentBreadcrumb[];
  chip?: string;
  meta: string[];
  titleLines: ContentInlineText[];
  standfirst: string;
  stats?: ContentHeroStat[];
}

export interface ContentFigureData {
  src: string;
  alt: string;
  label: string;
  caption: string;
  badge?: string;
  meta?: string;
  aspect?: 'wide' | 'landscape' | 'portrait';
}

export interface ContentValue {
  number: string;
  title: string;
  description: string;
}

export interface ContentAsideNote {
  label: string;
  html: string;
}

export interface ContentTimelineItem {
  year: string;
  title: string;
  description: string;
  isCurrent?: boolean;
}

export interface ContentLink {
  title: string;
  description: string;
  href: string;
  sourceLabel: string;
  meta: string;
  glyph: string;
  external?: boolean;
  tint?: string;
}

export interface ContentShortcut {
  label: string;
  href: string;
}

export interface ContentCta {
  eyebrow: string;
  title: ContentInlineText;
  body: string;
  primary: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
}

export interface ContentProseBlock {
  type: 'prose';
  paragraphs: string[];
}

export interface ContentVerseBlock {
  type: 'verse';
  reference: string;
  text: string;
}

export interface ContentValuesBlock {
  type: 'values';
  values: ContentValue[];
  note?: ContentAsideNote;
}

export interface ContentTimelineBlock {
  type: 'timeline';
  items: ContentTimelineItem[];
}

export interface ContentPullquoteBlock {
  type: 'pullquote';
  quote: string;
  cite?: string;
}

export interface ContentFigureBlock {
  type: 'figure';
  figure: ContentFigureData;
}

export interface ContentTeamBlock {
  /** The people come from the public API (`getPeople('team')`), not from the page data. */
  type: 'team';
}

export interface ContentLinkGridBlock {
  type: 'linkGrid';
  links: ContentLink[];
}

export interface ContentCtaBlock {
  type: 'cta';
  cta: ContentCta;
}

export interface ContentFactsBlock {
  type: 'facts';
  facts: { label: string; value: string }[];
}

export type ContentBlock =
  | ContentFactsBlock
  | ContentProseBlock
  | ContentVerseBlock
  | ContentValuesBlock
  | ContentTimelineBlock
  | ContentPullquoteBlock
  | ContentFigureBlock
  | ContentTeamBlock
  | ContentLinkGridBlock
  | ContentCtaBlock;

export interface ContentSection {
  id: string;
  eyebrow: string;
  tocLabel: string;
  title: ContentInlineText;
  description?: string;
  blocks: ContentBlock[];
}

export interface ContentPage {
  routeGroup: ContentPageRouteGroup;
  slug: string;
  aliases?: string[];
  title: string;
  seoTitle?: string;
  description: string;
  hero: ContentHero;
  featuredImage?: ContentFigureData;
  shortcuts?: ContentShortcut[];
  /** Heading of the sticky in-page index. */
  tocTitle?: string;
  /** Label of the shortcuts box under the index. */
  shortcutsTitle?: string;
  sections: ContentSection[];
  cta?: ContentCta;
}

function localizeHtmlLinks(html: string, locale: Locale) {
  return html.replace(/href="(\/[^"]*)"/g, (_, href: string) => {
    return `href="${localizePath(href, locale)}"`;
  });
}

function localizeHref(href: string, locale: Locale) {
  return /^(https?:|mailto:|tel:)/i.test(href)
    ? href
    : localizePath(href, locale);
}

function localizeCta(cta: ContentCta, locale: Locale): ContentCta {
  return {
    ...cta,
    primary: {
      ...cta.primary,
      href: localizeHref(cta.primary.href, locale),
    },
    secondary: cta.secondary
      ? {
          ...cta.secondary,
          href: localizeHref(cta.secondary.href, locale),
        }
      : undefined,
  };
}

function localizeBlock(block: ContentBlock, locale: Locale): ContentBlock {
  if (block.type === 'values') {
    return {
      ...block,
      note: block.note
        ? {
            ...block.note,
            html: localizeHtmlLinks(block.note.html, locale),
          }
        : undefined,
    };
  }

  if (block.type === 'linkGrid') {
    return {
      ...block,
      links: block.links.map((link) => ({
        ...link,
        href: localizeHref(link.href, locale),
      })),
    };
  }

  if (block.type === 'cta') {
    return {
      ...block,
      cta: localizeCta(block.cta, locale),
    };
  }

  return block;
}

function localizeContentPage(page: ContentPage, locale: Locale): ContentPage {
  return {
    ...page,
    hero: {
      ...page.hero,
      breadcrumbs: page.hero.breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        href: breadcrumb.href
          ? localizeHref(breadcrumb.href, locale)
          : undefined,
      })),
    },
    shortcuts: page.shortcuts?.map((shortcut) => ({
      ...shortcut,
      href: localizeHref(shortcut.href, locale),
    })),
    sections: page.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => localizeBlock(block, locale)),
    })),
    cta: page.cta ? localizeCta(page.cta, locale) : undefined,
  };
}

/**
 * `tokens` fill the church's own data (times, address, handles) into the message templates; they
 * are filled before the links are localized because some of them are URLs.
 */
export function getContentPages(
  locale: Locale = defaultLocale,
  tokens: SiteTokens = {}
): ContentPage[] {
  const nosotros = interpolateDeep(
    getMessages(locale).contentPages.nosotros as ContentPage,
    tokens
  );
  return [localizeContentPage(nosotros, locale)];
}

export function getContentPagesByRouteGroup(
  routeGroup: ContentPageRouteGroup,
  locale: Locale = defaultLocale,
  tokens: SiteTokens = {}
): ContentPage[] {
  return getContentPages(locale, tokens).filter(
    (page) => page.routeGroup === routeGroup
  );
}

export function getContentPageStaticPaths(
  routeGroup: ContentPageRouteGroup,
  locale: Locale = defaultLocale
) {
  return getContentPagesByRouteGroup(routeGroup, locale).flatMap((page) => {
    const slugs = [page.slug, ...(page.aliases ?? [])];
    return slugs.map((slug) => ({
      params: { slug },
      props: { page, isAlias: slug !== page.slug, locale },
    }));
  });
}

/**
 * Resuelve una página de contenido por su slug (o alias) en runtime (SSR).
 * Devuelve null si no existe ninguna coincidencia en el grupo de rutas dado.
 */
export function getContentPageBySlug(
  routeGroup: ContentPageRouteGroup,
  slug: string,
  context: { locale: Locale; tokens: SiteTokens }
): { page: ContentPage; isAlias: boolean } | null {
  const { locale, tokens } = context;
  for (const page of getContentPagesByRouteGroup(routeGroup, locale, tokens)) {
    if (page.slug === slug) return { page, isAlias: false };
    if (page.aliases?.includes(slug)) return { page, isAlias: true };
  }
  return null;
}

export function getLocalizedContentPageStaticPaths(
  routeGroup: ContentPageRouteGroup
) {
  return nonDefaultLocales.flatMap((locale) =>
    getContentPageStaticPaths(routeGroup, locale).map((path) => ({
      ...path,
      params: {
        ...path.params,
        locale,
      },
    }))
  );
}
