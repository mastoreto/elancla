import {
  MINISTRY_CATEGORY_NAME_MAX_LENGTH,
  MINISTRY_ORDER_MAX,
  type MinistryCategoryDto,
  type UpdateMinistryCategoryBody,
  type UpsertMinistryCategoryBody,
} from "@ancla/contracts";
import type { CategoryFormErrors, CategoryFormValues } from "../../types";

const ORDER_MESSAGE = `Un número entero entre 0 y ${MINISTRY_ORDER_MAX}.`;
const ORDER_PATTERN = /^\d{1,4}$/;

/** The form state for every language: what the category holds, blank for the rest. */
export function toCategoryFormValues(
  category: MinistryCategoryDto | null,
  locales: readonly string[],
  nextOrder = 0,
): CategoryFormValues {
  return {
    order: String(category?.order ?? nextOrder),
    names: Object.fromEntries(
      locales.map((locale) => [locale, category?.translations[locale]?.name ?? ""]),
    ),
  };
}

/**
 * The body to send. The default language always goes; a blank name of any other language is left
 * out (and so removed, since PATCH replaces every translation).
 */
export function toUpsertCategoryBody(
  values: CategoryFormValues,
  defaultLocale: string,
): UpsertMinistryCategoryBody {
  const translations = Object.entries(values.names)
    .filter(([locale, name]) => locale === defaultLocale || name.trim() !== "")
    .map(([locale, name]) => [locale, { name: name.trim() }] as const);
  return { order: Number(values.order), translations: Object.fromEntries(translations) };
}

export function toUpdateCategoryBody(
  values: CategoryFormValues,
  defaultLocale: string,
  version: number,
): UpdateMinistryCategoryBody {
  return { ...toUpsertCategoryBody(values, defaultLocale), version };
}

/** Field errors for what would be sent; empty when the body is valid. */
export function validateCategoryForm(
  values: CategoryFormValues,
  defaultLocale: string,
): CategoryFormErrors {
  const errors: CategoryFormErrors = { names: {} };
  if (!ORDER_PATTERN.test(values.order.trim())) errors.order = ORDER_MESSAGE;
  for (const [locale, name] of Object.entries(values.names)) {
    const trimmed = name.trim();
    const required = locale === defaultLocale;
    if ((required && trimmed === "") || trimmed.length > MINISTRY_CATEGORY_NAME_MAX_LENGTH) {
      errors.names[locale] =
        `Escribe un nombre de hasta ${MINISTRY_CATEGORY_NAME_MAX_LENGTH} caracteres.`;
    }
  }
  return errors;
}

export function hasCategoryErrors(errors: CategoryFormErrors): boolean {
  return errors.order !== undefined || Object.keys(errors.names).length > 0;
}
