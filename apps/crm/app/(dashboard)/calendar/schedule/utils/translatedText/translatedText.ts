import type { LocaleErrors, LocaleTexts } from "../../types";

/** The form state for every language: what the entity holds, blank for the rest. */
export function toLocaleTexts<Translation>(
  translations: Record<string, Translation>,
  pickText: (translation: Translation) => string,
  locales: readonly string[],
): LocaleTexts {
  return Object.fromEntries(
    locales.map((locale) => {
      const translation = translations[locale];
      return [locale, translation ? pickText(translation) : ""];
    }),
  );
}

/**
 * The translations to send. The default language always goes; a blank text of any other language
 * is left out (and so removed, since PATCH replaces every translation).
 */
export function toTranslations<Translation>(
  texts: LocaleTexts,
  defaultLocale: string,
  wrap: (text: string) => Translation,
): Record<string, Translation> {
  const filled = Object.entries(texts)
    .filter(([locale, text]) => locale === defaultLocale || text.trim() !== "")
    .map(([locale, text]) => [locale, wrap(text.trim())] as const);
  return Object.fromEntries(filled);
}

/** Error by locale: the default language is required and every text has a length limit. */
export function validateTexts(
  texts: LocaleTexts,
  defaultLocale: string,
  maxLength: number,
): LocaleErrors {
  const errors: LocaleErrors = {};
  for (const [locale, text] of Object.entries(texts)) {
    const trimmed = text.trim();
    const missing = locale === defaultLocale && trimmed === "";
    if (missing || trimmed.length > maxLength) {
      errors[locale] = `Escribe un texto de hasta ${maxLength} caracteres.`;
    }
  }
  return errors;
}

/** Locales whose text is still blank: the tabs flag them. */
export function incompleteLocales(texts: LocaleTexts, locales: readonly string[]): string[] {
  return locales.filter((locale) => (texts[locale] ?? "").trim() === "");
}

/** The text in the default language, else the first one the entity has, else `fallback`. */
export function pickTranslated<Translation>(
  translations: Record<string, Translation>,
  pickText: (translation: Translation) => string,
  defaultLocale: string,
  fallback: string,
): string {
  const preferred = translations[defaultLocale];
  const first = Object.values(translations)[0];
  const chosen = preferred ?? first;
  return chosen ? pickText(chosen) : fallback;
}
