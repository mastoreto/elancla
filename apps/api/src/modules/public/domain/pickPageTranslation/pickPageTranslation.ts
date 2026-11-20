import type {
  SimplePageSnapshot,
  SimplePageTranslation,
} from "@ancla/contracts";

export interface PickedPageTranslation {
  locale: string;
  translation: SimplePageTranslation;
}

/** The requested language, or the default one when the page lacks it; `null` if it has neither. */
export function pickPageTranslation(
  snapshot: Record<string, unknown>,
  { locale, defaultLocale }: { locale: string; defaultLocale: string },
): PickedPageTranslation | null {
  const { translations } = snapshot as unknown as SimplePageSnapshot;
  for (const candidate of [locale, defaultLocale]) {
    const translation = translations[candidate];
    if (translation) return { locale: candidate, translation };
  }
  return null;
}
