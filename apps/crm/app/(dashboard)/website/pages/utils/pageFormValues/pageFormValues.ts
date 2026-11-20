import { type RichTextDoc, type SimplePageTranslation, simplePageSnapshot } from "@ancla/contracts";
import type { PageFormValues, PageTranslationValues } from "../../types";

export const EMPTY_BODY: RichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

/** A body with no block, or only empty paragraphs, counts as not written. */
export function isBodyEmpty(body: RichTextDoc): boolean {
  return body.content.every((block) => block.type === "paragraph" && !block.content?.length);
}

function emptyTranslation(): PageTranslationValues {
  return {
    title: "",
    slug: "",
    slugEdited: false,
    body: EMPTY_BODY,
    seoTitle: "",
    seoDescription: "",
  };
}

function fromStored(stored: SimplePageTranslation): PageTranslationValues {
  return {
    title: stored.title,
    slug: stored.slug,
    slugEdited: true,
    body: stored.body.content.length > 0 ? stored.body : EMPTY_BODY,
    seoTitle: stored.seoTitle ?? "",
    seoDescription: stored.seoDescription ?? "",
  };
}

/** The form state for every language: what the snapshot holds, blank for the rest. */
export function toPageFormValues(
  snapshot: Record<string, unknown> | null,
  locales: readonly string[],
): PageFormValues {
  const parsed = snapshot ? simplePageSnapshot.safeParse(snapshot) : null;
  const stored = parsed?.success ? parsed.data.translations : {};
  return Object.fromEntries(
    locales.map((locale) => {
      const translation = stored[locale];
      return [locale, translation ? fromStored(translation) : emptyTranslation()];
    }),
  );
}

function isTranslationBlank(values: PageTranslationValues): boolean {
  return (
    values.title.trim() === "" &&
    values.slug.trim() === "" &&
    values.seoTitle.trim() === "" &&
    values.seoDescription.trim() === "" &&
    isBodyEmpty(values.body)
  );
}

function toTranslationInput(values: PageTranslationValues): Record<string, unknown> {
  const seoTitle = values.seoTitle.trim();
  const seoDescription = values.seoDescription.trim();
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    body: values.body,
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
  };
}

/**
 * The snapshot to send. The default language always goes (the API requires it); a blank
 * translation of any other language is left out so it does not fail validation.
 */
export function toPageSnapshot(
  values: PageFormValues,
  defaultLocale: string,
): { translations: Record<string, Record<string, unknown>> } {
  const translations = Object.entries(values)
    .filter(([locale, translation]) => locale === defaultLocale || !isTranslationBlank(translation))
    .map(([locale, translation]) => [locale, toTranslationInput(translation)] as const);
  return { translations: Object.fromEntries(translations) };
}
