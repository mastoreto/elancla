import type { TaxonomyField, TaxonomyFormErrors } from "../../types";

interface IssueLike {
  path: readonly PropertyKey[];
  message: string;
}

const FIELD_MESSAGES: Record<TaxonomyField, string> = {
  name: "Escribe un nombre válido.",
  slug: "Usa solo minúsculas, números y guiones, sin guiones al inicio, al final ni repetidos.",
  description: "La descripción es demasiado larga.",
};

function isTaxonomyField(key: unknown): key is TaxonomyField {
  return key === "name" || key === "slug" || key === "description";
}

/** Turns zod issues of `translations.<locale>.<field>` and `order` into field errors. */
export function mapTranslationIssues(
  issues: readonly IssueLike[],
  orderMessage: string,
): TaxonomyFormErrors {
  const errors: TaxonomyFormErrors = { translations: {} };
  for (const issue of issues) {
    const [root, locale, field] = issue.path;
    if (root === "order") errors.order = orderMessage;
    if (root !== "translations" || typeof locale !== "string" || !isTaxonomyField(field)) continue;
    const current = errors.translations[locale] ?? {};
    errors.translations[locale] = { ...current, [field]: current[field] ?? FIELD_MESSAGES[field] };
  }
  return errors;
}

export function hasTaxonomyErrors(errors: TaxonomyFormErrors): boolean {
  return errors.order !== undefined || Object.keys(errors.translations).length > 0;
}
