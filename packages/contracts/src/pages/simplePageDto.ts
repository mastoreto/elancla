import { z } from "zod";
import { revisionSummaryDto } from "../editorial";

/** `title` is the default-language one of the working (or else live) revision; null before any draft. */
export const simplePageListItemDto = z.strictObject({
  id: z.uuid(),
  title: z.string().nullable(),
  live: revisionSummaryDto.nullable(),
  working: revisionSummaryDto.nullable(),
});
export type SimplePageListItemDto = z.infer<typeof simplePageListItemDto>;

export const simplePageListDto = z.strictObject({
  items: z.array(simplePageListItemDto),
});
export type SimplePageListDto = z.infer<typeof simplePageListDto>;

export const createSimplePageResponse = z.strictObject({ id: z.uuid() });
export type CreateSimplePageResponse = z.infer<typeof createSimplePageResponse>;
