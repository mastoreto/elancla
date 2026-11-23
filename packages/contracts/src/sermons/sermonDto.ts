import { z } from "zod";
import { revisionSummaryDto } from "../editorial";
import { PLATFORM_INPUT_MAX_LENGTH, platformLinkDto } from "../platforms";
import { SERMON_SERIES_TITLE_MAX_LENGTH } from "./sermonConstants";

/**
 * `POST /content/sermons`: the pasted video (URL or id) and, optionally, its series: an existing
 * one or a minimal new one by title. Never both. The video is looked up again on the server; a bad,
 * private, missing or already linked video creates nothing.
 */
export const createSermonBody = z
  .strictObject({
    video: z.string().trim().min(1).max(PLATFORM_INPUT_MAX_LENGTH),
    seriesId: z.uuid().optional(),
    newSeriesTitle: z
      .string()
      .trim()
      .min(1)
      .max(SERMON_SERIES_TITLE_MAX_LENGTH)
      .optional(),
  })
  .refine(
    (body) => body.seriesId === undefined || body.newSeriesTitle === undefined,
    {
      message: "Send seriesId or newSeriesTitle, not both",
      path: ["newSeriesTitle"],
    },
  );
export type CreateSermonBody = z.infer<typeof createSermonBody>;

export const createSermonResponse = z.strictObject({ id: z.uuid() });
export type CreateSermonResponse = z.infer<typeof createSermonResponse>;

/**
 * Row of the CRM sermons table. `title`, `preacher`, `series` and `preachedOn` come from the
 * working revision (else the live one) and are null before the first draft. `platform` carries the
 * views, which are only for the CRM: the public API never exposes them.
 */
export const sermonListItemDto = z.strictObject({
  id: z.uuid(),
  /** Title in the organization's default language. */
  title: z.string().nullable(),
  preachedOn: z.string().nullable(),
  preacher: z.strictObject({ id: z.uuid(), name: z.string() }).nullable(),
  series: z.strictObject({ id: z.uuid(), title: z.string() }).nullable(),
  live: revisionSummaryDto.nullable(),
  working: revisionSummaryDto.nullable(),
  platform: platformLinkDto.nullable(),
});
export type SermonListItemDto = z.infer<typeof sermonListItemDto>;

export const sermonListDto = z.strictObject({
  items: z.array(sermonListItemDto),
});
export type SermonListDto = z.infer<typeof sermonListDto>;
