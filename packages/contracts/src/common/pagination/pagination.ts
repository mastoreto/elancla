import { z } from "zod";

export const DEFAULT_PAGE_LIMIT = 25;
export const MAX_PAGE_LIMIT = 100;

/** Cursor pagination query. The cursor is the id (UUIDv7, time-ordered) of the last item seen. */
export const pageQuerySchema = z.strictObject({
  cursor: z.uuid().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export type PageQuery = z.infer<typeof pageQuerySchema>;

export function pageSchema<Item extends z.ZodType>(item: Item) {
  return z.object({
    items: z.array(item),
    nextCursor: z.uuid().nullable(),
  });
}

export interface Page<Item> {
  items: Item[];
  nextCursor: string | null;
}
