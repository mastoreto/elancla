import { z } from "zod";
import { revisionSummaryDto } from "../editorial";

/**
 * Row of the CRM posts table. `title`, `category` and `author` come from the working revision
 * (else the live one) and are null before the first draft. The view counts are only for the CRM:
 * the public API never exposes them.
 */
export const postListItemDto = z.strictObject({
  id: z.uuid(),
  /** Title in the organization's default language. */
  title: z.string().nullable(),
  category: z.strictObject({ id: z.uuid(), name: z.string() }).nullable(),
  author: z.strictObject({ id: z.uuid(), name: z.string() }).nullable(),
  live: revisionSummaryDto.nullable(),
  working: revisionSummaryDto.nullable(),
  views30d: z.number().int().min(0),
  viewsTotal: z.number().int().min(0),
});
export type PostListItemDto = z.infer<typeof postListItemDto>;

export const postListDto = z.strictObject({ items: z.array(postListItemDto) });
export type PostListDto = z.infer<typeof postListDto>;

export const createPostResponse = z.strictObject({ id: z.uuid() });
export type CreatePostResponse = z.infer<typeof createPostResponse>;
