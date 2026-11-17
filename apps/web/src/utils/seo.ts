import { SITE_FALLBACK, type SiteConfig } from '@ancla/content';

export type { SiteConfig } from '@ancla/content';

// Valores por defecto del sitio. La fuente real es la BD vía getSiteConfig()
// (ver @ancla/content/site); SITE se mantiene como fallback sincrónico.
export const SITE: SiteConfig = SITE_FALLBACK;

export type PageType = 'website' | 'article' | 'profile';

export interface SEOArticleMeta {
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  section?: string;
  tags?: string[];
}

export interface SEOBreadcrumb {
  name: string;
  url: string;
}

export function absoluteUrl(path: string | URL, site = SITE.url): string {
  if (path instanceof URL) return path.toString();
  if (/^https?:/i.test(path)) return path;
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${site}${trimmed}`;
}

const WEEKDAYS: Record<string, string> = {
  Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
};

/** Parses "Su 11:15-12:30" (SiteConfig.serviceTimes); falls back to the Sunday service. */
function parseServiceTimes(summary: string) {
  const match = summary.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  return {
    dayOfWeek: WEEKDAYS[match?.[1] ?? 'Su'],
    opens: match?.[2] ?? '11:15',
    closes: match?.[3] ?? '12:30',
  };
}

export function mapLink(site: SiteConfig) {
  return (
    site.mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${site.geo.latitude},${site.geo.longitude}`
  );
}

export function buildOrganizationLd(site: SiteConfig = SITE) {
  const service = parseServiceTimes(site.serviceTimes);
  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    '@id': `${site.url}#organization`,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    logo: absoluteUrl('/images/anclarojo.png', site.url),
    image: absoluteUrl(site.defaultImage, site.url),
    description: site.defaultDescription,
    foundingDate: site.founded,
    email: site.contactEmail,
    knowsLanguage: ['es', 'pt', 'en'],
    hasMap: mapLink(site),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', ...service },
    ],
    sameAs: [
      site.social.youtube,
      site.social.instagram,
      site.social.facebook,
    ].filter(Boolean),
    areaServed: {
      '@type': 'City',
      name: site.address.city,
    },
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export function buildFaqLd(items: FaqItem[]) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Weekly Sunday service as a recurring Event (starts at the next Sunday occurrence is not needed: schedule is enough). */
export function buildServiceEventLd(params: {
  name: string;
  description: string;
  url: string;
  site: SiteConfig;
  language: string;
}) {
  const { site } = params;
  const service = parseServiceTimes(site.serviceTimes);
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: params.language,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    isAccessibleForFree: true,
    eventSchedule: {
      '@type': 'Schedule',
      repeatFrequency: 'P1W',
      byDay: `https://schema.org/${service.dayOfWeek}`,
      startTime: service.opens,
      endTime: service.closes,
      scheduleTimezone: 'America/Montevideo',
    },
    location: {
      '@type': 'Place',
      name: site.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
    },
    organizer: { '@id': `${site.url}#organization` },
  };
}

export function buildWebsiteLd(site: SiteConfig = SITE, language = site.lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}#website`,
    url: site.url,
    name: site.name,
    description: site.defaultDescription,
    inLanguage: language,
    publisher: { '@id': `${site.url}#organization` },
  };
}

export function buildBreadcrumbsLd(items: SEOBreadcrumb[]) {
  if (!items?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function buildArticleLd(params: {
  url: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  section?: string;
  tags?: string[];
  language?: string;
  site?: SiteConfig;
}) {
  const site = params.site ?? SITE;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: [absoluteUrl(params.image, site.url)],
    datePublished: params.publishedAt,
    dateModified: params.modifiedAt ?? params.publishedAt,
    author: {
      '@type': 'Person',
      name: params.authorName ?? site.name,
    },
    publisher: { '@id': `${site.url}#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(params.url),
    },
    inLanguage: params.language ?? SITE.lang,
    articleSection: params.section,
    keywords: params.tags?.join(', '),
  };
}
