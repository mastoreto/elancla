import { z } from "zod";
import { richTextDocSchema } from "../common";

export const SIMPLE_PAGE_TITLE_MAX_LENGTH = 120;
export const SIMPLE_PAGE_SLUG_MAX_LENGTH = 80;
export const SIMPLE_PAGE_SEO_TITLE_MAX_LENGTH = 70;
export const SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH = 160;

export const SIMPLE_PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slugs that already mean something at the site root: pages, public folders and locales. A simple
 * page can never take them, or it would shadow (or be shadowed by) the real route.
 * ponytail: keep in sync by hand with `apps/web/src/pages`; a test there checks the folders.
 */
export const RESERVED_ROOT_SLUGS: readonly string[] = [
  "404",
  "api",
  "assets",
  "blog",
  "calendario-anual",
  "confesion-de-fe",
  "en",
  "es",
  "images",
  "ministerios",
  "nosotros",
  "pt",
  "sermones",
  "visitanos",
];

export const simplePageSlug = z
  .string()
  .min(1)
  .max(SIMPLE_PAGE_SLUG_MAX_LENGTH)
  .regex(SIMPLE_PAGE_SLUG_PATTERN)
  .refine((slug) => !RESERVED_ROOT_SLUGS.includes(slug), {
    message: "This slug is reserved",
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

/** One language of a page. Strict: unknown keys are a client bug, not something to store. */
export const simplePageTranslation = z.strictObject({
  title: z.string().trim().min(1).max(SIMPLE_PAGE_TITLE_MAX_LENGTH),
  slug: simplePageSlug,
  body: richTextDocSchema,
  seoTitle: optionalText(SIMPLE_PAGE_SEO_TITLE_MAX_LENGTH),
  seoDescription: optionalText(SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH),
});
export type SimplePageTranslation = z.infer<typeof simplePageTranslation>;

/**
 * What a revision of a simple page holds. At least one language is required here; that the
 * organization's default one is present, and that no unknown locale slips in, is checked
 * against the organization by the API (the schema cannot know it).
 */
export const simplePageSnapshot = z.strictObject({
  translations: z
    .record(z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/), simplePageTranslation)
    .refine((translations) => Object.keys(translations).length > 0, {
      message: "At least one language is required",
    }),
});
export type SimplePageSnapshot = z.infer<typeof simplePageSnapshot>;
