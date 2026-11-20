import type { SimplePageSnapshot } from "@ancla/contracts";
import type { OrganizationLocales } from "../editorialTypes";

/** What the static schema cannot know: the default language must be there, no unknown one. */
export function validateSimplePageLocales(
  snapshot: Record<string, unknown>,
  { locales, defaultLocale }: OrganizationLocales,
): string | null {
  const { translations } = snapshot as SimplePageSnapshot;
  if (!translations[defaultLocale]) {
    return `The ${defaultLocale} translation (the default language) is required`;
  }
  const unknown = Object.keys(translations).find(
    (locale) => !locales.includes(locale),
  );
  return unknown ? `The language ${unknown} is not enabled` : null;
}
