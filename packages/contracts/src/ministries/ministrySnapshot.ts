import { z } from "zod";
import { BLOG_SLUG_PATTERN } from "../blog/blogPostSnapshot";
import { richTextDocSchema } from "../common";
import {
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
} from "./ministryConstants";

const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

export const ministryValue = z.strictObject({
  title: z.string().trim().min(1).max(MINISTRY_VALUE_TITLE_MAX_LENGTH),
  description: z.string().trim().max(MINISTRY_VALUE_DESCRIPTION_MAX_LENGTH),
});
export type MinistryValue = z.infer<typeof ministryValue>;

/** One language of a ministry profile. Strict: an unknown key is a client bug, not data. */
export const ministryTranslation = z.strictObject({
  name: z.string().trim().min(1).max(MINISTRY_NAME_MAX_LENGTH),
  slug: z
    .string()
    .min(1)
    .max(MINISTRY_SLUG_MAX_LENGTH)
    .regex(BLOG_SLUG_PATTERN),
  tagline: z.string().trim().min(1).max(MINISTRY_TAGLINE_MAX_LENGTH),
  about: richTextDocSchema,
  values: z.array(ministryValue).max(MINISTRY_VALUES_MAX_COUNT).default([]),
  place: optionalText(MINISTRY_PLACE_MAX_LENGTH),
  audience: optionalText(MINISTRY_AUDIENCE_MAX_LENGTH),
  howToJoin: optionalText(MINISTRY_HOW_TO_JOIN_MAX_LENGTH),
  nextStep: optionalText(MINISTRY_NEXT_STEP_MAX_LENGTH),
  coverAlt: optionalText(MINISTRY_COVER_ALT_MAX_LENGTH),
  seoTitle: optionalText(MINISTRY_SEO_TITLE_MAX_LENGTH),
  seoDescription: optionalText(MINISTRY_SEO_DESCRIPTION_MAX_LENGTH),
});
export type MinistryTranslation = z.infer<typeof ministryTranslation>;

/**
 * What a revision of a ministry profile holds. That the default language is present, that no
 * unknown locale slips in, that the slugs are free and that the media belong to the organization
 * is checked by the API (a schema cannot know it).
 */
export const ministrySnapshot = z.strictObject({
  translations: z
    .record(z.string().regex(LOCALE_PATTERN), ministryTranslation)
    .refine((translations) => Object.keys(translations).length > 0, {
      message: "At least one language is required",
    }),
  coverMediaId: z.uuid().optional(),
  /** Image for social cards; the cover when absent. */
  socialImageId: z.uuid().optional(),
});
export type MinistrySnapshot = z.infer<typeof ministrySnapshot>;
