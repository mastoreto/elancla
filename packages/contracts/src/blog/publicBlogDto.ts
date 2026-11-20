import { z } from "zod";
import { personStatDto } from "../people/personStatDto";
import { publicLocaleQuery } from "../public/publicSiteSettingsDto";
import { BLOG_COVER_GLYPHS, BLOG_COVER_TINTS } from "./blogCover";
import {
  publicBlogImageDto,
  publicBlogRichTextDocSchema,
} from "./blogRichText";

/*
 * Public blog contract (`/public/v1`). Deliberately no ids of any kind (posts, categories,
 * series, authors, media) and no view counts: it is public and versioned. `.strict()` everywhere.
 */

export const publicBlogQuery = publicLocaleQuery;

export const RECORD_POST_VIEW_USER_AGENT_MAX_LENGTH = 512;
export const RECORD_POST_VIEW_IP_MAX_LENGTH = 64;

/**
 * Body the web forwards for `POST posts/:slug/views`. They only feed the anonymous hash: the API
 * never stores them. An empty user agent is valid input (it is counted as a bot, not rejected).
 */
export const recordPostViewBody = z.strictObject({
  ip: z.string().trim().min(1).max(RECORD_POST_VIEW_IP_MAX_LENGTH),
  userAgent: z.string().max(RECORD_POST_VIEW_USER_AGENT_MAX_LENGTH),
});
export type RecordPostViewBody = z.infer<typeof recordPostViewBody>;

/** `null` when the cover photo is not ready (the site then draws its default cover). */
export const publicBlogCoverDto = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("photo"),
    alt: z.string(),
    image: publicBlogImageDto,
  }),
  z.strictObject({
    kind: z.literal("design"),
    glyph: z.enum(BLOG_COVER_GLYPHS),
    tint: z.enum(BLOG_COVER_TINTS),
  }),
]);
export type PublicBlogCoverDto = z.infer<typeof publicBlogCoverDto>;

const publicBlogCategoryRefDto = z.strictObject({
  slug: z.string(),
  name: z.string(),
});

/** `urlDate` is the `YYYY-MM-DD` of the post URL (`Post.firstLiveAt` in the organization time zone). */
export const publicPostSummaryDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  /** The language this entry is in (the default one when the requested one has no translation). */
  locale: z.string(),
  urlDate: z.string(),
  /** Displayed date: `publishAt ?? firstLiveAt`, ISO. */
  publishedAt: z.iso.datetime(),
  /** Edition number: order of first publication among the visible posts (1 = oldest). */
  issue: z.number().int().min(1),
  readingMinutes: z.number().int().min(1),
  category: publicBlogCategoryRefDto,
  authorName: z.string(),
  tags: z.array(z.string()),
  cover: publicBlogCoverDto.nullable(),
});
export type PublicPostSummaryDto = z.infer<typeof publicPostSummaryDto>;

export const PUBLIC_SERIES_ITEM_STATES = [
  "published",
  "current",
  "next",
] as const;

/**
 * One entry of a series. `next` is a scheduled post: only its title and date are shown, so `slug`,
 * `urlDate` and `readingMinutes` are null. `current` marks the post being read (detail only).
 */
export const publicSeriesItemDto = z.strictObject({
  order: z.number().int(),
  title: z.string(),
  slug: z.string().nullable(),
  urlDate: z.string().nullable(),
  publishedAt: z.iso.datetime(),
  readingMinutes: z.number().int().min(1).nullable(),
  state: z.enum(PUBLIC_SERIES_ITEM_STATES),
});
export type PublicSeriesItemDto = z.infer<typeof publicSeriesItemDto>;

export const publicSeriesDto = z.strictObject({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  items: z.array(publicSeriesItemDto),
});
export type PublicSeriesDto = z.infer<typeof publicSeriesDto>;

/** Categories with at least one visible post, with how many. */
export const publicBlogCategoryDto = z.strictObject({
  slug: z.string(),
  name: z.string(),
  count: z.number().int().min(0),
});
export type PublicBlogCategoryDto = z.infer<typeof publicBlogCategoryDto>;

export const publicBlogArchiveEntryDto = z.strictObject({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  count: z.number().int().min(1),
});
export type PublicBlogArchiveEntryDto = z.infer<
  typeof publicBlogArchiveEntryDto
>;

export const publicBlogTagDto = z.strictObject({
  tag: z.string(),
  count: z.number().int().min(1),
});
export type PublicBlogTagDto = z.infer<typeof publicBlogTagDto>;

/** `GET posts`. `popular` is ordered by the last 30 days of views but carries no counts. */
export const publicBlogIndexDto = z.strictObject({
  locale: z.string(),
  posts: z.array(publicPostSummaryDto),
  featured: publicPostSummaryDto.nullable(),
  categories: z.array(publicBlogCategoryDto),
  series: z.array(publicSeriesDto),
  archive: z.array(publicBlogArchiveEntryDto),
  popular: z.array(publicPostSummaryDto),
  tags: z.array(publicBlogTagDto),
});
export type PublicBlogIndexDto = z.infer<typeof publicBlogIndexDto>;

export const publicBlogTocEntryDto = z.strictObject({
  id: z.string(),
  text: z.string(),
});
export type PublicBlogTocEntryDto = z.infer<typeof publicBlogTocEntryDto>;

/**
 * Author of a post. `profile` is null when the BLOG_AUTHOR role is not visible: the post then
 * shows the name only, without a card.
 */
export const publicPostAuthorDto = z.strictObject({
  name: z.string(),
  initials: z.string(),
  profile: z
    .strictObject({
      photo: z.array(publicBlogImageDto).nullable(),
      bio: z.string().nullable(),
      title: z.string().nullable(),
      stats: z.array(personStatDto),
      /** Visible posts of this author. */
      articleCount: z.number().int().min(0),
    })
    .nullable(),
});
export type PublicPostAuthorDto = z.infer<typeof publicPostAuthorDto>;

/** `GET posts/:slug`: the body is the JSON document (the web renders it), not HTML. */
export const publicPostDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  /** The language actually served (the default one when the requested one has no translation). */
  locale: z.string(),
  urlDate: z.string(),
  publishedAt: z.iso.datetime(),
  /** When the live revision was last published, for `modifiedAt` and sitemaps; null if unknown. */
  modifiedAt: z.iso.datetime().nullable(),
  writtenAt: z.string(),
  issue: z.number().int().min(1),
  readingMinutes: z.number().int().min(1),
  wordCount: z.number().int().min(0),
  toc: z.array(publicBlogTocEntryDto),
  body: publicBlogRichTextDocSchema,
  tags: z.array(z.string()),
  cover: publicBlogCoverDto.nullable(),
  category: publicBlogCategoryRefDto,
  author: publicPostAuthorDto,
  series: publicSeriesDto.nullable(),
  related: z.array(publicPostSummaryDto).max(3),
  previous: publicPostSummaryDto.nullable(),
  next: publicPostSummaryDto.nullable(),
  /** Slug of the post in every language it has, for `hreflang`. */
  alternates: z.record(z.string(), z.string()),
});
export type PublicPostDto = z.infer<typeof publicPostDto>;
