import { z } from "zod";
import { BLOG_SLUG_PATTERN } from "./blogPostSnapshot";

export const CATEGORY_NAME_MAX_LENGTH = 60;
export const CATEGORY_ORDER_MAX = 9999;

const categoryTranslationDto = z.strictObject({
  name: z.string().trim().min(1).max(CATEGORY_NAME_MAX_LENGTH),
  slug: z.string().min(1).max(80).regex(BLOG_SLUG_PATTERN),
});

export const categoryDto = z.strictObject({
  id: z.uuid(),
  order: z.number().int(),
  version: z.number().int(),
  translations: z.record(z.string(), categoryTranslationDto),
});
export type CategoryDto = z.infer<typeof categoryDto>;

export const categoryListDto = z.strictObject({ items: z.array(categoryDto) });
export type CategoryListDto = z.infer<typeof categoryListDto>;

/** Create body. `translations` needs at least one language; the API checks the default one. */
export const upsertCategoryBody = z.strictObject({
  order: z.number().int().min(0).max(CATEGORY_ORDER_MAX),
  translations: z
    .record(z.string(), categoryTranslationDto)
    .refine((translations) => Object.keys(translations).length > 0, {
      message: "At least one language is required",
    }),
});
export type UpsertCategoryBody = z.infer<typeof upsertCategoryBody>;

/** PATCH body: the same fields plus the `version` read, for the optimistic lock (409 `stale_version`). */
export const updateCategoryBody = upsertCategoryBody.extend({
  version: z.number().int().min(1),
});
export type UpdateCategoryBody = z.infer<typeof updateCategoryBody>;
