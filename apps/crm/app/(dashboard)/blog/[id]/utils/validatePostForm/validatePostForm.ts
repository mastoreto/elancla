import {
  BLOG_POST_EXCERPT_MAX_LENGTH,
  BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH,
  BLOG_POST_SEO_TITLE_MAX_LENGTH,
  BLOG_POST_SLUG_MAX_LENGTH,
  BLOG_POST_TAG_MAX_LENGTH,
  BLOG_POST_TAGS_MAX_COUNT,
  BLOG_POST_TITLE_MAX_LENGTH,
  BLOG_SLUG_PATTERN,
  blogPostSnapshot,
} from "@ancla/contracts";
import type {
  PostFormErrors,
  PostFormValues,
  PostGeneralField,
  PostTranslationField,
} from "../../types";
import { toPostSnapshot } from "../postFormValues";

const TRANSLATION_MESSAGES: Record<PostTranslationField, string> = {
  title: `Escribe un título de hasta ${BLOG_POST_TITLE_MAX_LENGTH} caracteres.`,
  slug: "El slug no es válido.",
  excerpt: `Escribe un extracto de hasta ${BLOG_POST_EXCERPT_MAX_LENGTH} caracteres.`,
  body: "El contenido no es válido: revisa los enlaces, los videos y que no sea demasiado largo.",
  tags: `Hasta ${BLOG_POST_TAGS_MAX_COUNT} etiquetas de ${BLOG_POST_TAG_MAX_LENGTH} caracteres como máximo.`,
  seoTitle: `El título SEO admite hasta ${BLOG_POST_SEO_TITLE_MAX_LENGTH} caracteres.`,
  seoDescription: `La descripción SEO admite hasta ${BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH} caracteres.`,
};

const GENERAL_MESSAGES: Record<PostGeneralField, string> = {
  authorProfileId: "Elige quién escribió el artículo.",
  categoryId: "Elige una categoría.",
  seriesOrder: "Indica la posición dentro de la serie (un número desde 1).",
  relatedPostIds: "Elige hasta 3 artículos relacionados, sin repetir.",
  cover: "Completa la portada: sube una foto o elige un diseño.",
  writtenAt: "Indica la fecha en que se escribió.",
  publishAt: "La fecha de publicación no es válida.",
};

const TRANSLATION_FIELD_BY_KEY: Record<string, PostTranslationField> = {
  title: "title",
  slug: "slug",
  excerpt: "excerpt",
  body: "body",
  tags: "tags",
  seoTitle: "seoTitle",
  seoDescription: "seoDescription",
};

function isGeneralField(key: unknown): key is PostGeneralField {
  return typeof key === "string" && key in GENERAL_MESSAGES;
}

/** Why a slug cannot be used, in Spanish; `null` when it is fine. */
export function describeSlugProblem(slug: string): string | null {
  if (slug === "") return "Escribe el slug del artículo.";
  if (slug.length > BLOG_POST_SLUG_MAX_LENGTH) {
    return `El slug admite hasta ${BLOG_POST_SLUG_MAX_LENGTH} caracteres.`;
  }
  if (!BLOG_SLUG_PATTERN.test(slug)) {
    return "Usa solo minúsculas, números y guiones, sin guiones al inicio, al final ni repetidos.";
  }
  return null;
}

/** Field errors for what would be sent; empty when the snapshot is valid. */
export function validatePostForm(values: PostFormValues, defaultLocale: string): PostFormErrors {
  const snapshot = toPostSnapshot(values, defaultLocale);
  const errors: PostFormErrors = { translations: {}, general: {} };
  const addTranslationError = (locale: string, field: PostTranslationField, message: string) => {
    const current = errors.translations[locale] ?? {};
    errors.translations[locale] = { ...current, [field]: current[field] ?? message };
  };

  const sent = snapshot.translations as Record<string, { slug: string }>;
  for (const [locale, translation] of Object.entries(sent)) {
    const slugProblem = describeSlugProblem(translation.slug);
    if (slugProblem) addTranslationError(locale, "slug", slugProblem);
  }

  const result = blogPostSnapshot.safeParse(snapshot);
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const [root, locale, field] = issue.path;
    if (root === "translations" && typeof locale === "string" && typeof field === "string") {
      const translationField = TRANSLATION_FIELD_BY_KEY[field];
      if (translationField && translationField !== "slug") {
        addTranslationError(locale, translationField, TRANSLATION_MESSAGES[translationField]);
      }
      continue;
    }
    // A tag past the limit fails at `translations.<locale>.tags.<n>`: `field` is still "tags".
    if (isGeneralField(root)) errors.general[root] ??= GENERAL_MESSAGES[root];
  }
  return errors;
}

export function hasPostFormErrors(errors: PostFormErrors): boolean {
  return (
    Object.keys(errors.general).length > 0 ||
    Object.values(errors.translations).some((fields) => Object.keys(fields).length > 0)
  );
}
