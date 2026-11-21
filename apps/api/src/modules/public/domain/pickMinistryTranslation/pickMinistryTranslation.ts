import type { MinistrySnapshot, MinistryTranslation } from "@ancla/contracts";

export interface PickedMinistryTranslation {
  locale: string;
  translation: MinistryTranslation;
}

/** The requested language, or the default one when the profile lacks it; `null` if it has neither. */
export function pickMinistryTranslation(
  snapshot: Record<string, unknown>,
  { locale, defaultLocale }: { locale: string; defaultLocale: string },
): PickedMinistryTranslation | null {
  const { translations } = snapshot as unknown as MinistrySnapshot;
  for (const candidate of [locale, defaultLocale]) {
    const translation = translations[candidate];
    if (translation) return { locale: candidate, translation };
  }
  return null;
}
