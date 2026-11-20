import type { PublicVisitDto } from "@ancla/contracts";
import type { PublicVisitRows } from "../../data";

type DirectionKey = keyof PublicVisitDto["directions"];

const DIRECTION_COLUMNS = {
  parking: "directionsParking",
  transit: "directionsTransit",
  accessibility: "directionsAccessibility",
} as const;

/** Blank text counts as missing, so the fallback applies and an empty box never reaches the web. */
function nonBlank(text: string | null | undefined): string | null {
  const trimmed = text?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Each direction falls back to the default language on its own; so does each FAQ as a whole
 * (a question is never served with the answer of another language). No ids leave through here.
 */
export function toPublicVisitDto(
  { settings, faqs }: PublicVisitRows,
  languages: { locale: string; defaultLocale: string },
): PublicVisitDto {
  const { locale, defaultLocale } = languages;
  const translations = settings?.translations ?? [];
  const directionOf = (key: DirectionKey): string | null => {
    const column = DIRECTION_COLUMNS[key];
    const textIn = (wanted: string): string | null =>
      nonBlank(translations.find((row) => row.locale === wanted)?.[column]);
    return textIn(locale) ?? textIn(defaultLocale);
  };
  return {
    directions: {
      parking: directionOf("parking"),
      transit: directionOf("transit"),
      accessibility: directionOf("accessibility"),
    },
    faqs: faqs.flatMap(({ translations: rows }) => {
      const text =
        rows.find((row) => row.locale === locale) ??
        rows.find((row) => row.locale === defaultLocale);
      return text ? [{ question: text.question, answer: text.answer }] : [];
    }),
  };
}
