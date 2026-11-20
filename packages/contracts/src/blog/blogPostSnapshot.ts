import { z } from "zod";
import { blogCoverSchema } from "./blogCover";
import { blogRichTextDocSchema } from "./blogRichText";

export const BLOG_POST_TITLE_MAX_LENGTH = 140;
export const BLOG_POST_SLUG_MAX_LENGTH = 80;
export const BLOG_POST_EXCERPT_MAX_LENGTH = 300;
export const BLOG_POST_TAGS_MAX_COUNT = 8;
export const BLOG_POST_TAG_MAX_LENGTH = 40;
export const BLOG_POST_SEO_TITLE_MAX_LENGTH = 70;
export const BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH = 160;
export const BLOG_POST_RELATED_MAX_COUNT = 3;
export const BLOG_POST_SERIES_ORDER_MAX = 999;

export const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

export const blogSlug = z
  .string()
  .min(1)
  .max(BLOG_POST_SLUG_MAX_LENGTH)
  .regex(BLOG_SLUG_PATTERN);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

/** One language of a post. Strict: unknown keys are a client bug, not something to store. */
export const blogPostTranslation = z.strictObject({
  title: z.string().trim().min(1).max(BLOG_POST_TITLE_MAX_LENGTH),
  slug: blogSlug,
  excerpt: z.string().trim().min(1).max(BLOG_POST_EXCERPT_MAX_LENGTH),
  body: blogRichTextDocSchema,
  tags: z
    .array(z.string().trim().min(1).max(BLOG_POST_TAG_MAX_LENGTH))
    .max(BLOG_POST_TAGS_MAX_COUNT)
    .default([]),
  seoTitle: optionalText(BLOG_POST_SEO_TITLE_MAX_LENGTH),
  seoDescription: optionalText(BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH),
});
export type BlogPostTranslation = z.infer<typeof blogPostTranslation>;

/**
 * What a revision of a post holds. At least one language is required here; that the
 * organization's default one is present, that no unknown locale slips in, and that the author,
 * category, series, media and slugs exist and are free, is checked by the API against the
 * organization (a schema cannot know it).
 */
export const blogPostSnapshot = z
  .strictObject({
    translations: z
      .record(z.string().regex(LOCALE_PATTERN), blogPostTranslation)
      .refine((translations) => Object.keys(translations).length > 0, {
        message: "At least one language is required",
      }),
    /** A person profile with the BLOG_AUTHOR role. */
    authorProfileId: z.uuid(),
    categoryId: z.uuid(),
    seriesId: z.uuid().optional(),
    /** Position inside the series; present exactly when `seriesId` is. */
    seriesOrder: z
      .number()
      .int()
      .min(1)
      .max(BLOG_POST_SERIES_ORDER_MAX)
      .optional(),
    featured: z.boolean().default(false),
    relatedPostIds: z
      .array(z.uuid())
      .max(BLOG_POST_RELATED_MAX_COUNT)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Related posts cannot repeat",
      })
      .default([]),
    cover: blogCoverSchema,
    /** Day the author wrote it (`YYYY-MM-DD`); informative, not the URL date. */
    writtenAt: z.iso.date(),
    /** When it becomes visible (ISO datetime with offset); absent means as soon as published. */
    publishAt: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(
    (post) =>
      (post.seriesId === undefined) === (post.seriesOrder === undefined),
    {
      message: "seriesId and seriesOrder go together",
      path: ["seriesOrder"],
    },
  );
export type BlogPostSnapshot = z.infer<typeof blogPostSnapshot>;
