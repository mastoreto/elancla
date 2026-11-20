import type { OrganizationLocales } from "../editorialTypes";

/**
 * What a static schema cannot know about any translated snapshot (`{ translations: { <locale>: … } }`):
 * the default language must be there and no unknown one may slip in.
 */
export function validateSnapshotLocales(
  snapshot: Record<string, unknown>,
  { locales, defaultLocale }: OrganizationLocales,
): string | null {
  const translations = (snapshot.translations ?? {}) as Record<string, unknown>;
  if (!translations[defaultLocale]) {
    return `The ${defaultLocale} translation (the default language) is required`;
  }
  const unknown = Object.keys(translations).find(
    (locale) => !locales.includes(locale),
  );
  return unknown ? `The language ${unknown} is not enabled` : null;
}
