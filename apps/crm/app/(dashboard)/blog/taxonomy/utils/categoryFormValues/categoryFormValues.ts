import {
  CATEGORY_ORDER_MAX,
  type CategoryDto,
  type UpdateCategoryBody,
  type UpsertCategoryBody,
  upsertCategoryBody,
} from "@ancla/contracts";
import type {
  CategoryFormValues,
  CategoryTranslationValues,
  TaxonomyFormErrors,
} from "../../types";
import { mapTranslationIssues } from "../mapTranslationIssues";

const ORDER_MESSAGE = `Un número entero entre 0 y ${CATEGORY_ORDER_MAX}.`;
const ORDER_PATTERN = /^\d{1,4}$/;

function emptyTranslation(): CategoryTranslationValues {
  return { name: "", slug: "", slugEdited: false };
}

/** The form state for every language: what the category holds, blank for the rest. */
export function toCategoryFormValues(
  category: CategoryDto | null,
  locales: readonly string[],
  nextOrder = 0,
): CategoryFormValues {
  return {
    order: String(category?.order ?? nextOrder),
    translations: Object.fromEntries(
      locales.map((locale) => {
        const stored = category?.translations[locale];
        return [
          locale,
          stored ? { name: stored.name, slug: stored.slug, slugEdited: true } : emptyTranslation(),
        ];
      }),
    ),
  };
}

function isBlank({ name, slug }: CategoryTranslationValues): boolean {
  return name.trim() === "" && slug.trim() === "";
}

/**
 * The body to send. The default language always goes; a blank translation of any other language
 * is left out (and so removed, since PATCH replaces every translation).
 */
export function toUpsertCategoryBody(
  values: CategoryFormValues,
  defaultLocale: string,
): UpsertCategoryBody {
  const translations = Object.entries(values.translations)
    .filter(([locale, translation]) => locale === defaultLocale || !isBlank(translation))
    .map(([locale, { name, slug }]) => [locale, { name: name.trim(), slug: slug.trim() }] as const);
  return { order: Number(values.order), translations: Object.fromEntries(translations) };
}

export function toUpdateCategoryBody(
  values: CategoryFormValues,
  defaultLocale: string,
  version: number,
): UpdateCategoryBody {
  return { ...toUpsertCategoryBody(values, defaultLocale), version };
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateCategoryForm(
  values: CategoryFormValues,
  defaultLocale: string,
): TaxonomyFormErrors {
  const orderValid = ORDER_PATTERN.test(values.order.trim());
  const body = toUpsertCategoryBody(
    { ...values, order: orderValid ? values.order : "0" },
    defaultLocale,
  );
  const result = upsertCategoryBody.safeParse(body);
  const errors = result.success
    ? { translations: {} }
    : mapTranslationIssues(result.error.issues, ORDER_MESSAGE);
  return orderValid ? errors : { ...errors, order: ORDER_MESSAGE };
}
