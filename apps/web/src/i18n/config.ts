export const defaultLocale = 'es' as const;

export const locales = ['es', 'pt', 'en'] as const;

export type Locale = (typeof locales)[number];

export interface LocaleMeta {
  code: Locale;
  label: string;
  name: string;
  nativeName: string;
  flag: string;
  htmlLang: string;
  hreflang: string;
  ogLocale: string;
  pathPrefix: string;
}

export const localeMeta = {
  es: {
    code: 'es',
    label: 'ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇺🇾',
    htmlLang: 'es-UY',
    hreflang: 'es-UY',
    ogLocale: 'es_UY',
    pathPrefix: '',
  },
  pt: {
    code: 'pt',
    label: 'PT',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    htmlLang: 'pt-BR',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    pathPrefix: '/pt',
  },
  en: {
    code: 'en',
    label: 'EN',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    htmlLang: 'en-US',
    hreflang: 'en-US',
    ogLocale: 'en_US',
    pathPrefix: '/en',
  },
} satisfies Record<Locale, LocaleMeta>;

export const nonDefaultLocales = locales.filter(
  (locale) => locale !== defaultLocale
) as Exclude<Locale, typeof defaultLocale>[];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}
