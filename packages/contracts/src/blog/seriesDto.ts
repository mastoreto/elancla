import { z } from "zod";
import { BLOG_SLUG_PATTERN } from "./blogPostSnapshot";

export const SERIES_NAME_MAX_LENGTH = 80;
export const SERIES_DESCRIPTION_MAX_LENGTH = 300;

const seriesTranslationDto = z.strictObject({
  name: z.string().trim().min(1).max(SERIES_NAME_MAX_LENGTH),
  slug: z.string().min(1).max(80).regex(BLOG_SLUG_PATTERN),
  description: z.string().trim().max(SERIES_DESCRIPTION_MAX_LENGTH).nullable(),
});

export const seriesDto = z.strictObject({
  id: z.uuid(),
  version: z.number().int(),
  translations: z.record(z.string(), seriesTranslationDto),
});
export type SeriesDto = z.infer<typeof seriesDto>;

export const seriesListDto = z.strictObject({ items: z.array(seriesDto) });
export type SeriesListDto = z.infer<typeof seriesListDto>;

/** Create body. `translations` needs at least one language; the API checks the default one. */
export const upsertSeriesBody = z.strictObject({
  translations: z
    .record(z.string(), seriesTranslationDto)
    .refine((translations) => Object.keys(translations).length > 0, {
      message: "At least one language is required",
    }),
});
export type UpsertSeriesBody = z.infer<typeof upsertSeriesBody>;

/** PATCH body: the same fields plus the `version` read, for the optimistic lock (409 `stale_version`). */
export const updateSeriesBody = upsertSeriesBody.extend({
  version: z.number().int().min(1),
});
export type UpdateSeriesBody = z.infer<typeof updateSeriesBody>;
