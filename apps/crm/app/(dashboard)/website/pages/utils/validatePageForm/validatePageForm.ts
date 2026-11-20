import {
  RESERVED_ROOT_SLUGS,
  SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH,
  SIMPLE_PAGE_SEO_TITLE_MAX_LENGTH,
  SIMPLE_PAGE_SLUG_MAX_LENGTH,
  SIMPLE_PAGE_SLUG_PATTERN,
  SIMPLE_PAGE_TITLE_MAX_LENGTH,
  simplePageSnapshot,
} from "@ancla/contracts";
import type { PageFormErrors, PageFormValues, PageTranslationField } from "../../types";
import { toPageSnapshot } from "../pageFormValues";

const FIELD_MESSAGES: Record<PageTranslationField, string> = {
  title: `Escribe un título de hasta ${SIMPLE_PAGE_TITLE_MAX_LENGTH} caracteres.`,
  slug: "El slug no es válido.",
  body: "El contenido no es válido: revisa los enlaces y que no sea demasiado largo.",
  seoTitle: `El título SEO admite hasta ${SIMPLE_PAGE_SEO_TITLE_MAX_LENGTH} caracteres.`,
  seoDescription: `La descripción SEO admite hasta ${SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH} caracteres.`,
};

const TRANSLATION_FIELDS = new Set<string>(Object.keys(FIELD_MESSAGES));

function isTranslationField(key: unknown): key is PageTranslationField {
  return typeof key === "string" && TRANSLATION_FIELDS.has(key);
}

/** Why a slug cannot be used, in Spanish; `null` when it is fine. */
export function describeSlugProblem(slug: string): string | null {
  if (slug === "") return "Escribe el slug de la página.";
  if (slug.length > SIMPLE_PAGE_SLUG_MAX_LENGTH) {
    return `El slug admite hasta ${SIMPLE_PAGE_SLUG_MAX_LENGTH} caracteres.`;
  }
  if (!SIMPLE_PAGE_SLUG_PATTERN.test(slug)) {
    return "Usa solo minúsculas, números y guiones, sin guiones al inicio, al final ni repetidos.";
  }
  if (RESERVED_ROOT_SLUGS.includes(slug)) return "Ese slug está reservado por el sitio.";
  return null;
}

/** Field errors by locale for what would be sent; empty when the snapshot is valid. */
export function validatePageForm(values: PageFormValues, defaultLocale: string): PageFormErrors {
  const snapshot = toPageSnapshot(values, defaultLocale);
  const errors: PageFormErrors = {};
  const addError = (locale: string, field: PageTranslationField, message: string) => {
    errors[locale] = { ...errors[locale], [field]: errors[locale]?.[field] ?? message };
  };

  for (const [locale, translation] of Object.entries(snapshot.translations)) {
    const slugProblem = describeSlugProblem(String(translation.slug));
    if (slugProblem) addError(locale, "slug", slugProblem);
  }

  const result = simplePageSnapshot.safeParse(snapshot);
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const [root, locale, field] = issue.path;
    if (root !== "translations" || typeof locale !== "string" || !isTranslationField(field)) {
      continue;
    }
    if (field !== "slug") addError(locale, field, FIELD_MESSAGES[field]);
  }
  return errors;
}

export function hasPageFormErrors(errors: PageFormErrors): boolean {
  return Object.values(errors).some((fields) => Object.keys(fields).length > 0);
}
