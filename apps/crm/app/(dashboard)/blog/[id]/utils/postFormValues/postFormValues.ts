import { type BlogPostTranslation, type BlogRichTextDoc, blogPostSnapshot } from "@ancla/contracts";
import type { PostCoverValues, PostFormValues, PostTranslationValues } from "../../types";
import { fromDateTimeLocal, toDateTimeLocal, todayInputValue } from "../dateTimeLocal";

export const EMPTY_BODY: BlogRichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

const DEFAULT_COVER: PostCoverValues = {
  kind: "design",
  mediaId: "",
  alt: "",
  previewUrl: null,
  glyph: "anchor",
  tint: "paper",
};

/** A body with no block, or only empty paragraphs, counts as not written. */
export function isBodyEmpty(body: BlogRichTextDoc): boolean {
  return body.content.every((block) => block.type === "paragraph" && !block.content?.length);
}

/** "fe, esperanza,, fe" becomes ["fe", "esperanza"]: trimmed, no blanks, no repeats. */
export function parseTags(tagsText: string): string[] {
  const tags = tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
  return [...new Set(tags)];
}

function emptyTranslation(): PostTranslationValues {
  return {
    title: "",
    slug: "",
    slugEdited: false,
    excerpt: "",
    body: EMPTY_BODY,
    tagsText: "",
    seoTitle: "",
    seoDescription: "",
  };
}

function fromStored(stored: BlogPostTranslation): PostTranslationValues {
  return {
    title: stored.title,
    slug: stored.slug,
    slugEdited: true,
    excerpt: stored.excerpt,
    body: stored.body.content.length > 0 ? stored.body : EMPTY_BODY,
    tagsText: stored.tags.join(", "),
    seoTitle: stored.seoTitle ?? "",
    seoDescription: stored.seoDescription ?? "",
  };
}

function blankForm(locales: readonly string[], today: string): PostFormValues {
  return {
    translations: Object.fromEntries(locales.map((locale) => [locale, emptyTranslation()])),
    authorProfileId: "",
    categoryId: "",
    seriesId: "",
    seriesOrder: "",
    featured: false,
    relatedPostIds: [],
    cover: DEFAULT_COVER,
    writtenAt: today,
    publishAt: "",
  };
}

/** The form state for every language: what the snapshot holds, blank for the rest. */
export function toPostFormValues(
  snapshot: Record<string, unknown> | null,
  locales: readonly string[],
  today: string = todayInputValue(),
): PostFormValues {
  const blank = blankForm(locales, today);
  const parsed = snapshot ? blogPostSnapshot.safeParse(snapshot) : null;
  if (!parsed?.success) return blank;
  const stored = parsed.data;
  const { cover } = stored;
  return {
    translations: Object.fromEntries(
      locales.map((locale) => {
        const translation = stored.translations[locale];
        return [locale, translation ? fromStored(translation) : emptyTranslation()];
      }),
    ),
    authorProfileId: stored.authorProfileId,
    categoryId: stored.categoryId,
    seriesId: stored.seriesId ?? "",
    seriesOrder: stored.seriesOrder === undefined ? "" : String(stored.seriesOrder),
    featured: stored.featured,
    relatedPostIds: stored.relatedPostIds,
    cover:
      cover.kind === "photo"
        ? { ...DEFAULT_COVER, kind: "photo", mediaId: cover.mediaId, alt: cover.alt }
        : { ...DEFAULT_COVER, kind: "design", glyph: cover.glyph, tint: cover.tint },
    writtenAt: stored.writtenAt,
    publishAt: toDateTimeLocal(stored.publishAt),
  };
}

function isTranslationBlank(values: PostTranslationValues): boolean {
  return (
    values.title.trim() === "" &&
    values.slug.trim() === "" &&
    values.excerpt.trim() === "" &&
    values.tagsText.trim() === "" &&
    values.seoTitle.trim() === "" &&
    values.seoDescription.trim() === "" &&
    isBodyEmpty(values.body)
  );
}

function toTranslationInput(values: PostTranslationValues): Record<string, unknown> {
  const seoTitle = values.seoTitle.trim();
  const seoDescription = values.seoDescription.trim();
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    excerpt: values.excerpt.trim(),
    body: values.body,
    tags: parseTags(values.tagsText),
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
  };
}

function toCoverInput(cover: PostCoverValues): Record<string, unknown> {
  return cover.kind === "photo"
    ? { kind: "photo", mediaId: cover.mediaId, alt: cover.alt.trim() }
    : { kind: "design", glyph: cover.glyph, tint: cover.tint };
}

/**
 * The snapshot to send, with exactly the keys the API's strict schema knows. The default language
 * always goes (the API requires it); a blank translation of any other language is left out so it
 * does not fail validation.
 */
export function toPostSnapshot(
  values: PostFormValues,
  defaultLocale: string,
): Record<string, unknown> {
  const translations = Object.entries(values.translations)
    .filter(([locale, translation]) => locale === defaultLocale || !isTranslationBlank(translation))
    .map(([locale, translation]) => [locale, toTranslationInput(translation)] as const);
  const hasSeries = values.seriesId !== "";
  const publishAt = fromDateTimeLocal(values.publishAt);
  return {
    translations: Object.fromEntries(translations),
    authorProfileId: values.authorProfileId,
    categoryId: values.categoryId,
    ...(hasSeries ? { seriesId: values.seriesId, seriesOrder: Number(values.seriesOrder) } : {}),
    featured: values.featured,
    relatedPostIds: values.relatedPostIds,
    cover: toCoverInput(values.cover),
    writtenAt: values.writtenAt,
    ...(publishAt ? { publishAt } : {}),
  };
}
