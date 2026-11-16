import {
  defaultLocale,
  isLocale,
  localeMeta,
  locales,
  type Locale,
} from './config';

type PathInput = string | URL;

function splitPath(path: string) {
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  return { pathname: pathname || '/', query, hash };
}

export function getLocaleFromUrl(input: PathInput): Locale {
  const pathname = input instanceof URL ? input.pathname : splitPath(input).pathname;
  const segment = pathname.split('/').filter(Boolean)[0];
  return isLocale(segment) ? segment : defaultLocale;
}

export function stripLocaleFromPath(path: string): string {
  const { pathname, query, hash } = splitPath(path);
  const segments = pathname.split('/').filter(Boolean);

  if (isLocale(segments[0])) {
    segments.shift();
  }

  const normalized = segments.length ? `/${segments.join('/')}` : '/';
  return `${normalized}${query}${hash}`;
}

export function localizePath(path: string, locale: Locale): string {
  if (/^(https?:|mailto:|tel:)/i.test(path)) return path;

  if (path.startsWith('#')) {
    return locale === defaultLocale ? `/${path}` : `/${locale}${path}`;
  }

  const stripped = stripLocaleFromPath(path);
  const { pathname, query, hash } = splitPath(stripped);
  const cleanPath = pathname === '/' ? '' : pathname;
  const prefix = localeMeta[locale].pathPrefix;
  const localizedPath = `${prefix}${cleanPath}` || '/';

  return `${localizedPath}${query}${hash}`;
}

export function getLocaleSwitcherLinks(path: string, currentLocale: Locale) {
  return locales.map((locale) => ({
    ...localeMeta[locale],
    href: localizePath(path, locale),
    current: locale === currentLocale,
  }));
}

export function getLanguageAlternates(path: string, siteUrl: string) {
  const canonicalPath = stripLocaleFromPath(path);
  const alternates = locales.map((locale) => ({
    hrefLang: localeMeta[locale].hreflang,
    href: new URL(localizePath(canonicalPath, locale), siteUrl).toString(),
  }));

  return [
    ...alternates,
    {
      hrefLang: 'x-default',
      href: new URL(localizePath(canonicalPath, defaultLocale), siteUrl).toString(),
    },
  ];
}

export function getHtmlLang(locale: Locale) {
  return localeMeta[locale].htmlLang;
}

export function getLocaleSeo(locale: Locale) {
  return {
    htmlLang: localeMeta[locale].htmlLang,
    hreflang: localeMeta[locale].hreflang,
    ogLocale: localeMeta[locale].ogLocale,
  };
}
