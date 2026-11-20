import type { VisitContentDto } from "@ancla/contracts";
import type { SettingsWithDirections, VisitFaqRow } from "../../data";

type DirectionsTranslation = SettingsWithDirections["translations"][number];

function hasDirections(row: DirectionsTranslation): boolean {
  return [
    row.directionsParking,
    row.directionsTransit,
    row.directionsAccessibility,
  ].some((text) => text !== null);
}

/** Explicit field list. A language with no direction text at all is left out of the map. */
export function toVisitContentDto(
  settings: SettingsWithDirections,
  faqs: VisitFaqRow[],
  organization: { locales: string[]; defaultLocale: string },
): VisitContentDto {
  return {
    directions: Object.fromEntries(
      settings.translations.filter(hasDirections).map((row) => [
        row.locale,
        {
          parking: row.directionsParking,
          transit: row.directionsTransit,
          accessibility: row.directionsAccessibility,
        },
      ]),
    ),
    faqs: faqs.map((faq) => ({
      id: faq.id,
      order: faq.order,
      translations: Object.fromEntries(
        faq.translations.map(({ locale, question, answer }) => [
          locale,
          { question, answer },
        ]),
      ),
    })),
    locales: organization.locales,
    defaultLocale: organization.defaultLocale,
  };
}
