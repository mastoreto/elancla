import { z } from "zod";
import { MINISTRY_ORDER_MAX } from "./ministryConstants";

export const MINISTRY_CATEGORY_NAME_MAX_LENGTH = 60;

const ministryCategoryTranslationDto = z.strictObject({
  name: z.string().trim().min(1).max(MINISTRY_CATEGORY_NAME_MAX_LENGTH),
});

export const ministryCategoryDto = z.strictObject({
  id: z.uuid(),
  order: z.number().int(),
  version: z.number().int(),
  translations: z.record(z.string(), ministryCategoryTranslationDto),
});
export type MinistryCategoryDto = z.infer<typeof ministryCategoryDto>;

export const ministryCategoryListDto = z.strictObject({
  items: z.array(ministryCategoryDto),
});
export type MinistryCategoryListDto = z.infer<typeof ministryCategoryListDto>;

/** Create body. `translations` needs at least one language; the API checks the default one. */
export const upsertMinistryCategoryBody = z.strictObject({
  order: z.number().int().min(0).max(MINISTRY_ORDER_MAX),
  translations: z
    .record(z.string(), ministryCategoryTranslationDto)
    .refine((translations) => Object.keys(translations).length > 0, {
      message: "At least one language is required",
    }),
});
export type UpsertMinistryCategoryBody = z.infer<
  typeof upsertMinistryCategoryBody
>;

/** PATCH body: the same fields plus the `version` read (409 `stale_version`). */
export const updateMinistryCategoryBody = upsertMinistryCategoryBody.extend({
  version: z.number().int().min(1),
});
export type UpdateMinistryCategoryBody = z.infer<
  typeof updateMinistryCategoryBody
>;
