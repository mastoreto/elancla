import type { SermonSnapshot, SermonTranslation } from "@ancla/contracts";

export interface PickedSermonTranslation {
  locale: string;
  translation: SermonTranslation;
}

/** The requested language, or the default one when the sermon lacks it; `null` if it has neither. */
export function pickSermonTranslation(
  snapshot: Pick<SermonSnapshot, "translations">,
  { locale, defaultLocale }: { locale: string; defaultLocale: string },
): PickedSermonTranslation | null {
  for (const candidate of [locale, defaultLocale]) {
    const translation = snapshot.translations[candidate];
    if (translation) return { locale: candidate, translation };
  }
  return null;
}
