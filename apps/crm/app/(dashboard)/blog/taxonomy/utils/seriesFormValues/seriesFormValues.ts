import {
  type SeriesDto,
  type UpdateSeriesBody,
  type UpsertSeriesBody,
  upsertSeriesBody,
} from "@ancla/contracts";
import type { SeriesFormValues, SeriesTranslationValues, TaxonomyFormErrors } from "../../types";
import { mapTranslationIssues } from "../mapTranslationIssues";

function emptyTranslation(): SeriesTranslationValues {
  return { name: "", slug: "", slugEdited: false, description: "" };
}

/** The form state for every language: what the series holds, blank for the rest. */
export function toSeriesFormValues(
  series: SeriesDto | null,
  locales: readonly string[],
): SeriesFormValues {
  return {
    translations: Object.fromEntries(
      locales.map((locale) => {
        const stored = series?.translations[locale];
        return [
          locale,
          stored
            ? {
                name: stored.name,
                slug: stored.slug,
                slugEdited: true,
                description: stored.description ?? "",
              }
            : emptyTranslation(),
        ];
      }),
    ),
  };
}

function isBlank({ name, slug, description }: SeriesTranslationValues): boolean {
  return name.trim() === "" && slug.trim() === "" && description.trim() === "";
}

/**
 * The body to send. The default language always goes; a blank translation of any other language
 * is left out (and so removed, since PATCH replaces every translation).
 */
export function toUpsertSeriesBody(
  values: SeriesFormValues,
  defaultLocale: string,
): UpsertSeriesBody {
  const translations = Object.entries(values.translations)
    .filter(([locale, translation]) => locale === defaultLocale || !isBlank(translation))
    .map(
      ([locale, { name, slug, description }]) =>
        [
          locale,
          { name: name.trim(), slug: slug.trim(), description: description.trim() || null },
        ] as const,
    );
  return { translations: Object.fromEntries(translations) };
}

export function toUpdateSeriesBody(
  values: SeriesFormValues,
  defaultLocale: string,
  version: number,
): UpdateSeriesBody {
  return { ...toUpsertSeriesBody(values, defaultLocale), version };
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateSeriesForm(
  values: SeriesFormValues,
  defaultLocale: string,
): TaxonomyFormErrors {
  const result = upsertSeriesBody.safeParse(toUpsertSeriesBody(values, defaultLocale));
  return result.success ? { translations: {} } : mapTranslationIssues(result.error.issues, "");
}
