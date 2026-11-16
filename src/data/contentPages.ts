import { defaultLocale, nonDefaultLocales, type Locale } from 'src/i18n/config';
import { getMessages } from 'src/i18n/messages';
import { localizePath } from 'src/i18n/utils';
import ministriesData from 'src/utils/ministriesData.json';

export type ContentPageRouteGroup = 'root' | 'ministerios';

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

export interface ContentPerson {
  name: string;
  role: string;
  bio: string;
  initials: string;
  tint?: string;
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
  type: 'team';
  people: ContentPerson[];
}

export interface ContentLinkGridBlock {
  type: 'linkGrid';
  links: ContentLink[];
}

export interface ContentCtaBlock {
  type: 'cta';
  cta: ContentCta;
}

export type ContentBlock =
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
  sections: ContentSection[];
  cta?: ContentCta;
}

interface MinistryTemplate {
  summaries: Record<string, string>;
  fallbackSummary: string;
  breadcrumbs: {
    home: string;
    ministries: string;
  };
  chip: string;
  metaLocation: string;
  titleSuffixBefore: string;
  titleSuffixEmphasis: string;
  standfirst: string;
  figureLabel: string;
  figureMeta: string;
  shortcuts: {
    all: string;
    visit: string;
    confession: string;
  };
  sections: {
    identityEyebrow: string;
    identityToc: string;
    identityTitleBefore: string;
    identityDescription: string;
    paragraphs: string[];
    values: ContentValue[];
    nextEyebrow: string;
    nextToc: string;
    nextTitleBefore: string;
    nextTitleEmphasis: string;
    links: ContentLink[];
  };
  cta: {
    eyebrow: string;
    titleBefore: string;
    body: string;
    primary: string;
    secondary: string;
  };
}

function normalizeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugFromMinistryUrl(url: string): string {
  return url.replace(/^\/ministerios\//, '').replace(/^\/|\/$/g, '');
}

function interpolate(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, replacement),
    value
  );
}

function localizeHtmlLinks(html: string, locale: Locale) {
  return html.replace(/href="(\/[^"]*)"/g, (_, href: string) => {
    return `href="${localizePath(href, locale)}"`;
  });
}

function localizeHref(href: string, locale: Locale) {
  return /^(https?:|mailto:|tel:)/i.test(href) ? href : localizePath(href, locale);
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
        href: breadcrumb.href ? localizeHref(breadcrumb.href, locale) : undefined,
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

function getMinistryCopy(locale: Locale, slug: string) {
  const ministry = getMessages(locale).ministries.items.find((item) => {
    if (!item.href.startsWith('/ministerios/')) return false;
    return normalizeSlug(slugFromMinistryUrl(item.href)) === slug;
  });

  return ministry;
}

function buildMinistryPages(locale: Locale): ContentPage[] {
  const template = getMessages(locale).contentPages.ministryTemplate as MinistryTemplate;

  return ministriesData
    .filter((ministry) => ministry.url.startsWith('/ministerios/'))
    .map((ministry, index) => {
      const rawSlug = slugFromMinistryUrl(ministry.url);
      const slug = normalizeSlug(rawSlug);
      const copy = getMinistryCopy(locale, slug);
      const name = copy?.name ?? ministry.name;
      const summary = template.summaries[slug] ?? copy?.description ?? template.fallbackSummary;
      const sectionNumber = String(index + 1).padStart(2, '0');

      const page: ContentPage = {
        routeGroup: 'ministerios',
        slug,
        aliases: rawSlug !== slug ? [rawSlug] : undefined,
        title: name,
        seoTitle: `${name} | ${template.breadcrumbs.ministries} | El Ancla`,
        description: `${name}: ${summary.toLowerCase()} en Iglesia Bautista El Ancla.`,
        hero: {
          breadcrumbs: [
            { label: template.breadcrumbs.home, href: '/' },
            { label: template.breadcrumbs.ministries, href: '/#ministerios' },
            { label: name },
          ],
          chip: template.chip,
          meta: [`Sec. ${sectionNumber} / ${name}`, template.metaLocation],
          titleLines: [
            { text: name },
            {
              before: template.titleSuffixBefore,
              emphasis: template.titleSuffixEmphasis,
            },
          ],
          standfirst: template.standfirst,
        },
        featuredImage: {
          src: '/images/homebanner.jpeg',
          alt: `${name} · Iglesia Bautista El Ancla`,
          label: template.figureLabel,
          caption: `${name} · ${summary}.`,
          badge: summary,
          meta: template.figureMeta,
          aspect: 'wide',
        },
        shortcuts: [
          { label: template.shortcuts.all, href: '/#ministerios' },
          { label: template.shortcuts.visit, href: '/#visitanos' },
          { label: template.shortcuts.confession, href: '/confesion-de-fe' },
        ],
        sections: [
          {
            id: 'identidad',
            eyebrow: template.sections.identityEyebrow,
            tocLabel: template.sections.identityToc,
            title: {
              before: interpolate(template.sections.identityTitleBefore, { name }),
              emphasis: summary.toLowerCase(),
            },
            description: template.sections.identityDescription,
            blocks: [
              {
                type: 'prose',
                paragraphs: template.sections.paragraphs.map((paragraph) =>
                  interpolate(paragraph, { name, summary })
                ),
              },
              {
                type: 'values',
                values: template.sections.values,
              },
            ],
          },
          {
            id: 'siguiente-paso',
            eyebrow: template.sections.nextEyebrow,
            tocLabel: template.sections.nextToc,
            title: {
              before: template.sections.nextTitleBefore,
              emphasis: template.sections.nextTitleEmphasis,
            },
            blocks: [
              {
                type: 'linkGrid',
                links: template.sections.links,
              },
            ],
          },
        ],
        cta: {
          eyebrow: template.cta.eyebrow,
          title: {
            before: template.cta.titleBefore,
            emphasis: `${name}.`,
          },
          body: template.cta.body,
          primary: {
            label: template.cta.primary,
            href: '/#visitanos',
          },
          secondary: {
            label: template.cta.secondary,
            href: '/#ministerios',
          },
        },
      };

      return localizeContentPage(page, locale);
    });
}

export function getContentPages(locale: Locale = defaultLocale): ContentPage[] {
  const nosotros = getMessages(locale).contentPages.nosotros as ContentPage;
  return [localizeContentPage(nosotros, locale), ...buildMinistryPages(locale)];
}

export function getContentPagesByRouteGroup(
  routeGroup: ContentPageRouteGroup,
  locale: Locale = defaultLocale
): ContentPage[] {
  return getContentPages(locale).filter((page) => page.routeGroup === routeGroup);
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

export function getLocalizedContentPageStaticPaths(routeGroup: ContentPageRouteGroup) {
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
