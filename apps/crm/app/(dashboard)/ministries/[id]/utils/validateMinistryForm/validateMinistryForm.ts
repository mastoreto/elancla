import {
  BLOG_SLUG_PATTERN,
  MINISTRY_AUDIENCE_MAX_LENGTH,
  MINISTRY_COVER_ALT_MAX_LENGTH,
  MINISTRY_HOW_TO_JOIN_MAX_LENGTH,
  MINISTRY_NAME_MAX_LENGTH,
  MINISTRY_NEXT_STEP_MAX_LENGTH,
  MINISTRY_PLACE_MAX_LENGTH,
  MINISTRY_SEO_DESCRIPTION_MAX_LENGTH,
  MINISTRY_SEO_TITLE_MAX_LENGTH,
  MINISTRY_SLUG_MAX_LENGTH,
  MINISTRY_TAGLINE_MAX_LENGTH,
  MINISTRY_VALUE_DESCRIPTION_MAX_LENGTH,
  MINISTRY_VALUE_TITLE_MAX_LENGTH,
  MINISTRY_VALUES_MAX_COUNT,
  ministrySnapshot,
} from "@ancla/contracts";
import type {
  MinistryFormErrors,
  MinistryFormValues,
  MinistryGeneralField,
  MinistryTranslationField,
} from "../../types";
import { toMinistrySnapshot } from "../ministryFormValues";

const TRANSLATION_MESSAGES: Record<MinistryTranslationField, string> = {
  name: `Escribe un nombre de hasta ${MINISTRY_NAME_MAX_LENGTH} caracteres.`,
  slug: "El slug no es válido.",
  tagline: `Escribe una frase de hasta ${MINISTRY_TAGLINE_MAX_LENGTH} caracteres.`,
  about: "El texto no es válido: revisa los enlaces y que no sea demasiado largo.",
  values: `Hasta ${MINISTRY_VALUES_MAX_COUNT} valores, con título (${MINISTRY_VALUE_TITLE_MAX_LENGTH}) y descripción (${MINISTRY_VALUE_DESCRIPTION_MAX_LENGTH}) dentro de su límite.`,
  place: `El lugar admite hasta ${MINISTRY_PLACE_MAX_LENGTH} caracteres.`,
  audience: `El público admite hasta ${MINISTRY_AUDIENCE_MAX_LENGTH} caracteres.`,
  howToJoin: `Cómo sumarse admite hasta ${MINISTRY_HOW_TO_JOIN_MAX_LENGTH} caracteres.`,
  nextStep: `El próximo paso admite hasta ${MINISTRY_NEXT_STEP_MAX_LENGTH} caracteres.`,
  coverAlt: `El texto alternativo admite hasta ${MINISTRY_COVER_ALT_MAX_LENGTH} caracteres.`,
  seoTitle: `El título SEO admite hasta ${MINISTRY_SEO_TITLE_MAX_LENGTH} caracteres.`,
  seoDescription: `La descripción SEO admite hasta ${MINISTRY_SEO_DESCRIPTION_MAX_LENGTH} caracteres.`,
};

const GENERAL_MESSAGES: Record<MinistryGeneralField, string> = {
  coverMediaId: "La portada no es válida. Súbela de nuevo.",
  socialImageId: "La imagen social no es válida. Súbela de nuevo.",
};

function isTranslationField(key: unknown): key is MinistryTranslationField {
  return typeof key === "string" && key in TRANSLATION_MESSAGES;
}

function isGeneralField(key: unknown): key is MinistryGeneralField {
  return typeof key === "string" && key in GENERAL_MESSAGES;
}

/** Why a slug cannot be used, in Spanish; `null` when it is fine. */
export function describeSlugProblem(slug: string): string | null {
  if (slug === "") return "Escribe el slug del ministerio.";
  if (slug.length > MINISTRY_SLUG_MAX_LENGTH) {
    return `El slug admite hasta ${MINISTRY_SLUG_MAX_LENGTH} caracteres.`;
  }
  if (!BLOG_SLUG_PATTERN.test(slug)) {
    return "Usa solo minúsculas, números y guiones, sin guiones al inicio, al final ni repetidos.";
  }
  return null;
}

/** Field errors for what would be sent; empty when the snapshot is valid. */
export function validateMinistryForm(
  values: MinistryFormValues,
  defaultLocale: string,
): MinistryFormErrors {
  const snapshot = toMinistrySnapshot(values, defaultLocale);
  const errors: MinistryFormErrors = { translations: {}, general: {} };
  const addTranslationError = (
    locale: string,
    field: MinistryTranslationField,
    message: string,
  ) => {
    const current = errors.translations[locale] ?? {};
    errors.translations[locale] = { ...current, [field]: current[field] ?? message };
  };

  const sent = snapshot.translations as Record<string, { slug: string }>;
  for (const [locale, translation] of Object.entries(sent)) {
    const slugProblem = describeSlugProblem(translation.slug);
    if (slugProblem) addTranslationError(locale, "slug", slugProblem);
  }

  const result = ministrySnapshot.safeParse(snapshot);
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const [root, locale, field] = issue.path;
    if (root === "translations" && typeof locale === "string" && isTranslationField(field)) {
      if (field !== "slug") addTranslationError(locale, field, TRANSLATION_MESSAGES[field]);
      continue;
    }
    if (isGeneralField(root)) errors.general[root] ??= GENERAL_MESSAGES[root];
  }
  return errors;
}

export function hasMinistryFormErrors(errors: MinistryFormErrors): boolean {
  return (
    Object.keys(errors.general).length > 0 ||
    Object.values(errors.translations).some((fields) => Object.keys(fields).length > 0)
  );
}
