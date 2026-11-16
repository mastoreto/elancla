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

export function buildOrganizationLd(site: SiteConfig = SITE) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Church', 'PlaceOfWorship', 'Organization'],
    '@id': `${site.url}#organization`,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    logo: absoluteUrl('/images/anclarojo.png', site.url),
    image: absoluteUrl(site.defaultImage, site.url),
    description: site.defaultDescription,
    foundingDate: site.founded,
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
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '11:15',
        closes: '12:30',
      },
    ],
    sameAs: [
      site.social.youtube,
      site.social.instagram,
      site.social.facebook,
    ].filter(Boolean),
    areaServed: {
      '@type': 'City',
      name: 'Montevideo',
    },
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
