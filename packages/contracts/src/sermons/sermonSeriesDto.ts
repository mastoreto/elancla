import { z } from "zod";
import { BLOG_SLUG_PATTERN } from "../blog";
import { mediaFileDto } from "../media";
import { PLATFORM_INPUT_MAX_LENGTH } from "../platforms";
import {
  SERMON_SERIES_DESCRIPTION_MAX_LENGTH,
  SERMON_SERIES_ORDER_MAX_VALUE,
  SERMON_SERIES_PLANNED_COUNT_MAX,
  SERMON_SERIES_TITLE_MAX_LENGTH,
  SERMON_SLUG_MAX_LENGTH,
  SERMON_TAG_MAX_LENGTH,
  SERMON_TAGS_MAX_COUNT,
} from "./sermonConstants";

const sermonSeriesTranslationDto = z.strictObject({
  title: z.string().trim().min(1).max(SERMON_SERIES_TITLE_MAX_LENGTH),
  slug: z.string().min(1).max(SERMON_SLUG_MAX_LENGTH).regex(BLOG_SLUG_PATTERN),
  description: z
    .string()
    .trim()
    .max(SERMON_SERIES_DESCRIPTION_MAX_LENGTH)
    .nullable(),
  tags: z
    .array(z.string().trim().min(1).max(SERMON_TAG_MAX_LENGTH))
    .max(SERMON_TAGS_MAX_COUNT),
});

/**
 * A series as the CRM edits it. `sermonCount` and the date range are computed from the live
 * sermons of the series (`null` dates when there are none).
 */
export const sermonSeriesDto = z.strictObject({
  id: z.uuid(),
  version: z.number().int(),
  order: z.number().int(),
  plannedCount: z.number().int().nullable(),
  /** Set when the series was imported from a YouTube playlist. */
  youtubePlaylistId: z.string().nullable(),
  cover: mediaFileDto.nullable(),
  sermonCount: z.number().int().min(0),
  firstPreachedOn: z.string().nullable(),
  lastPreachedOn: z.string().nullable(),
  translations: z.record(z.string(), sermonSeriesTranslationDto),
});
export type SermonSeriesDto = z.infer<typeof sermonSeriesDto>;

export const sermonSeriesListDto = z.strictObject({
  items: z.array(sermonSeriesDto),
});
export type SermonSeriesListDto = z.infer<typeof sermonSeriesListDto>;

/** Create body. `translations` needs at least one language; the API checks the default one. */
export const upsertSermonSeriesBody = z.strictObject({
  coverMediaId: z.uuid().nullable().default(null),
  plannedCount: z
    .number()
    .int()
    .min(1)
    .max(SERMON_SERIES_PLANNED_COUNT_MAX)
    .nullable()
    .default(null),
  order: z.number().int().min(0).max(SERMON_SERIES_ORDER_MAX_VALUE).default(0),
  translations: z
    .record(z.string(), sermonSeriesTranslationDto)
    .refine((translations) => Object.keys(translations).length > 0, {
      message: "At least one language is required",
    }),
});
export type UpsertSermonSeriesBody = z.infer<typeof upsertSermonSeriesBody>;

/** PATCH body: the same fields plus the `version` read, for the optimistic lock (409 `stale_version`). */
export const updateSermonSeriesBody = upsertSermonSeriesBody.extend({
  version: z.number().int().min(1),
});
export type UpdateSermonSeriesBody = z.infer<typeof updateSermonSeriesBody>;

/**
 * `POST /content/sermon-series/import`: a YouTube playlist (URL or id). It creates the linked
 * series with title, description and cover preloaded; it creates no sermons.
 */
export const importSeriesBody = z.strictObject({
  playlist: z.string().trim().min(1).max(PLATFORM_INPUT_MAX_LENGTH),
});
export type ImportSeriesBody = z.infer<typeof importSeriesBody>;
