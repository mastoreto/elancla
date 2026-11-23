import { z } from "zod";
import { publicBlogImageDto } from "../blog";
import { richTextDocSchema } from "../common";
import { publicLocaleQuery } from "../public/publicSiteSettingsDto";
import { bibleBookCode } from "./bibleBooks";

/*
 * Public sermons contract (`/public/v1`). Deliberately no ids of any kind (sermons, series,
 * preachers, media) and no view counts: it is public and versioned. The only id is `videoId`, the
 * one YouTube itself uses. `.strict()` everywhere.
 */

export const publicSermonQuery = publicLocaleQuery;

/**
 * What to draw as the picture of a sermon or a series: its own cover (image variants) or, when it
 * has none, the thumbnail of the platform. `null` when there is neither.
 */
export const publicSermonCoverDto = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("image"),
    images: z.array(publicBlogImageDto).min(1),
  }),
  z.strictObject({ kind: z.literal("thumbnail"), url: z.string() }),
]);
export type PublicSermonCoverDto = z.infer<typeof publicSermonCoverDto>;

/** A passage with every part always present (`null` when it does not apply). */
export const publicSermonPassageDto = z.strictObject({
  book: bibleBookCode,
  chapter: z.number().int().min(1),
  verseFrom: z.number().int().min(1).nullable(),
  chapterTo: z.number().int().min(1).nullable(),
  verseTo: z.number().int().min(1).nullable(),
});
export type PublicSermonPassageDto = z.infer<typeof publicSermonPassageDto>;

export const publicSermonPreacherDto = z.strictObject({ name: z.string() });
export type PublicSermonPreacherDto = z.infer<typeof publicSermonPreacherDto>;

export const publicSermonSeriesRefDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  /** Position of the sermon inside the series. */
  order: z.number().int().min(1),
});
export type PublicSermonSeriesRefDto = z.infer<typeof publicSermonSeriesRefDto>;

export const publicSermonSummaryDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  /** The language this entry is in (the default one when the requested one has no translation). */
  locale: z.string(),
  /** `YYYY-MM-DD`. */
  preachedOn: z.string(),
  /** YouTube video id. */
  videoId: z.string(),
  durationSeconds: z.number().int().min(0).nullable(),
  cover: publicSermonCoverDto.nullable(),
  series: publicSermonSeriesRefDto.nullable(),
  preacher: publicSermonPreacherDto.nullable(),
  passages: z.array(publicSermonPassageDto),
  tags: z.array(z.string()),
});
export type PublicSermonSummaryDto = z.infer<typeof publicSermonSummaryDto>;

/** Series with at least one live sermon. `count` and the dates are over the live sermons. */
export const publicSermonSeriesDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  cover: publicSermonCoverDto.nullable(),
  count: z.number().int().min(1),
  firstPreachedOn: z.string(),
  lastPreachedOn: z.string(),
});
export type PublicSermonSeriesDto = z.infer<typeof publicSermonSeriesDto>;

export const publicSermonPreacherCountDto = z.strictObject({
  name: z.string(),
  count: z.number().int().min(1),
});
export type PublicSermonPreacherCountDto = z.infer<
  typeof publicSermonPreacherCountDto
>;

export const publicSermonBookCountDto = z.strictObject({
  book: bibleBookCode,
  count: z.number().int().min(1),
});
export type PublicSermonBookCountDto = z.infer<typeof publicSermonBookCountDto>;

/**
 * `GET sermons`: the whole index, so the site filters on what it renders. `sermons` is newest
 * first. `featured` is the sermon flagged as featured (the newest one when several are) and, when
 * none is flagged, the newest sermon; it is null only when there are no sermons.
 */
export const publicSermonIndexDto = z.strictObject({
  locale: z.string(),
  sermons: z.array(publicSermonSummaryDto),
  featured: publicSermonSummaryDto.nullable(),
  series: z.array(publicSermonSeriesDto),
  preachers: z.array(publicSermonPreacherCountDto),
  /** Books cited by at least one live sermon, in canonical order. */
  books: z.array(publicSermonBookCountDto),
});
export type PublicSermonIndexDto = z.infer<typeof publicSermonIndexDto>;

/** A public PDF attached to a sermon. */
export const publicSermonAttachmentDto = z.strictObject({
  url: z.string(),
  name: z.string(),
  sizeBytes: z.number().int().min(0),
});
export type PublicSermonAttachmentDto = z.infer<
  typeof publicSermonAttachmentDto
>;

/** `GET sermons/:slug`. The notes and the outline are the base rich text document, not HTML. */
export const publicSermonDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  /** The language actually served (the default one when the requested one has no translation). */
  locale: z.string(),
  preachedOn: z.string(),
  /** YouTube video id. */
  videoId: z.string(),
  durationSeconds: z.number().int().min(0).nullable(),
  /** When the video was published on the platform (the `uploadDate` of the structured data). */
  uploadedAt: z.iso.datetime().nullable(),
  /** When the live revision was last published, for sitemaps; null if unknown. */
  modifiedAt: z.iso.datetime().nullable(),
  cover: publicSermonCoverDto.nullable(),
  preacher: publicSermonPreacherDto.nullable(),
  passages: z.array(publicSermonPassageDto),
  tags: z.array(z.string()),
  preacherNotes: richTextDocSchema.nullable(),
  outline: richTextDocSchema.nullable(),
  attachments: z.array(publicSermonAttachmentDto),
  series: publicSermonSeriesRefDto.nullable(),
  /** The neighbours inside the series, in series order; null at the ends or outside a series. */
  previous: publicSermonSummaryDto.nullable(),
  next: publicSermonSummaryDto.nullable(),
  /** Slug of the sermon in every language it has, for `hreflang`. */
  alternates: z.record(z.string(), z.string()),
});
export type PublicSermonDto = z.infer<typeof publicSermonDto>;

/** `GET live`: whether the channel is streaming right now. */
export const publicLiveDto = z.discriminatedUnion("live", [
  z.strictObject({ live: z.literal(false) }),
  z.strictObject({
    live: z.literal(true),
    videoId: z.string(),
    title: z.string(),
  }),
]);
export type PublicLiveDto = z.infer<typeof publicLiveDto>;
