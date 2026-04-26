export const SITE = {
  url: 'https://elancla.uy',
  name: 'Iglesia Bautista El Ancla',
  shortName: 'El Ancla',
  locale: 'es_UY',
  lang: 'es-UY',
  defaultTitle: 'Iglesia Bautista El Ancla',
  titleTemplate: '%s | Iglesia Bautista El Ancla',
  defaultDescription:
    'Iglesia Bautista El Ancla en Montevideo: una comunidad cristiana centrada en el evangelio. Reflexiones, ministerios y vida en comunidad. Domingos 11:15 hs.',
  defaultImage: '/images/homebanner.jpeg',
  themeColor: '#ff2e34',
  twitter: '@iglesiaelancla',
  address: {
    street: 'Av. Luis A. de Herrera 3101, esq. Juan Arrieta',
    city: 'Montevideo',
    region: 'Montevideo',
    country: 'UY',
    postalCode: '11600',
  },
  geo: {
    latitude: -34.872968,
    longitude: -56.161429,
  },
  contactEmail: 'contacto@elancla.uy',
  founded: '1997',
  serviceTimes: 'Su 11:15-12:30',
  social: {
    youtube: 'https://youtube.com/@iglesiaelanclauy',
    instagram: 'https://www.instagram.com/iglesiaelancla',
    facebook: 'https://www.facebook.com/iglesiabautistaelancla',
  },
};

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

export function buildOrganizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Church', 'PlaceOfWorship', 'Organization'],
    '@id': `${SITE.url}#organization`,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    logo: absoluteUrl('/images/anclarojo.png'),
    image: absoluteUrl(SITE.defaultImage),
    description: SITE.defaultDescription,
    foundingDate: SITE.founded,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '11:15',
        closes: '12:30',
      },
    ],
    sameAs: [SITE.social.youtube, SITE.social.instagram, SITE.social.facebook],
    areaServed: {
      '@type': 'City',
      name: 'Montevideo',
    },
  };
}

export function buildWebsiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.defaultDescription,
    inLanguage: SITE.lang,
    publisher: { '@id': `${SITE.url}#organization` },
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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: [absoluteUrl(params.image)],
    datePublished: params.publishedAt,
    dateModified: params.modifiedAt ?? params.publishedAt,
    author: {
      '@type': 'Person',
      name: params.authorName ?? SITE.name,
    },
    publisher: { '@id': `${SITE.url}#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(params.url),
    },
    inLanguage: SITE.lang,
    articleSection: params.section,
    keywords: params.tags?.join(', '),
  };
}
