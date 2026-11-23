import { z } from "zod";
import { BLOG_SLUG_PATTERN } from "../blog";
import { calendarDate } from "../calendar";
import { richTextDocSchema } from "../common";
import {
  SERMON_ATTACHMENTS_MAX_COUNT,
  SERMON_PASSAGES_MAX_COUNT,
  SERMON_SEO_DESCRIPTION_MAX_LENGTH,
  SERMON_SEO_TITLE_MAX_LENGTH,
  SERMON_SERIES_ORDER_MAX,
  SERMON_SLUG_MAX_LENGTH,
  SERMON_SUMMARY_MAX_LENGTH,
  SERMON_TAG_MAX_LENGTH,
  SERMON_TAGS_MAX_COUNT,
  SERMON_TITLE_MAX_LENGTH,
} from "./sermonConstants";
import { sermonPassage } from "./sermonPassage";

const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

export const sermonSlug = z
  .string()
  .min(1)
  .max(SERMON_SLUG_MAX_LENGTH)
  .regex(BLOG_SLUG_PATTERN);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

const optionalRichText = richTextDocSchema.optional();

/** One language of a sermon. Strict: unknown keys are a client bug, not something to store. */
export const sermonTranslation = z.strictObject({
  title: z.string().trim().min(1).max(SERMON_TITLE_MAX_LENGTH),
  slug: sermonSlug,
  summary: optionalText(SERMON_SUMMARY_MAX_LENGTH),
  tags: z
    .array(z.string().trim().min(1).max(SERMON_TAG_MAX_LENGTH))
    .max(SERMON_TAGS_MAX_COUNT)
    .default([]),
  /** The preacher's comments, in the base rich text (no blog-only nodes). */
  preacherNotes: optionalRichText,
  outline: optionalRichText,
  seoTitle: optionalText(SERMON_SEO_TITLE_MAX_LENGTH),
  seoDescription: optionalText(SERMON_SEO_DESCRIPTION_MAX_LENGTH),
});
export type SermonTranslation = z.infer<typeof sermonTranslation>;

const uniqueIds = (max: number) =>
  z
    .array(z.uuid())
    .max(max)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "An id can only be listed once",
    });

/**
 * What a revision of a sermon holds. What the video platform says (cover, duration, views, original
 * date) is not here: it lives in `PlatformLink` so refreshing it never overwrites what was edited.
 * That the default language is present, that no unknown locale slips in, and that the preacher,
 * series, media and slugs exist, belong to the organization and are free is checked by the API
 * against the organization (a schema cannot know it).
 */
export const sermonSnapshot = z
  .strictObject({
    translations: z
      .record(z.string().regex(LOCALE_PATTERN), sermonTranslation)
      .refine((translations) => Object.keys(translations).length > 0, {
        message: "At least one language is required",
      }),
    /** A person profile with the PREACHER role. */
    preacherProfileId: z.uuid().optional(),
    seriesId: z.uuid().optional(),
    /** Position inside the series; present exactly when `seriesId` is. */
    seriesOrder: z
      .number()
      .int()
      .min(1)
      .max(SERMON_SERIES_ORDER_MAX)
      .optional(),
    /** Day it was preached (`YYYY-MM-DD`). */
    preachedOn: calendarDate,
    passages: z.array(sermonPassage).max(SERMON_PASSAGES_MAX_COUNT).default([]),
    featured: z.boolean().default(false),
    /** Own cover (a `contentImage`); it replaces the thumbnail of the platform. */
    coverMediaId: z.uuid().optional(),
    /** PDFs (`contentDocument`). */
    attachmentMediaIds: uniqueIds(SERMON_ATTACHMENTS_MAX_COUNT).default([]),
  })
  .refine(
    (sermon) =>
      (sermon.seriesId === undefined) === (sermon.seriesOrder === undefined),
    {
      message: "seriesId and seriesOrder go together",
      path: ["seriesOrder"],
    },
  );
export type SermonSnapshot = z.infer<typeof sermonSnapshot>;
