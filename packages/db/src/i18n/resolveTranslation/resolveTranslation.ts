interface Localized {
  locale: string;
}

/**
 * Picks the translation for `locale`, falling back to the organization's default locale (D-26).
 * Returns null when neither exists so callers decide how to render a missing translation.
 */
export function resolveTranslation<T extends Localized>(
  translations: readonly T[],
  locale: string,
  defaultLocale: string,
): T | null {
  return (
    translations.find((translation) => translation.locale === locale) ??
    translations.find((translation) => translation.locale === defaultLocale) ??
    null
  );
}
