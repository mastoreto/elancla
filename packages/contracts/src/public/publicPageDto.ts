import { z } from "zod";
import { richTextDocSchema } from "../common";
import { publicLocaleQuery } from "./publicSiteSettingsDto";

export const publicPageQuery = publicLocaleQuery;

/** Entry of the pages list (footer, sitemap, llms.txt). No ids: the contract is public. */
export const publicPageSummaryDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
});
export type PublicPageSummaryDto = z.infer<typeof publicPageSummaryDto>;

export const publicPageListDto = z.strictObject({
  items: z.array(publicPageSummaryDto),
});
export type PublicPageListDto = z.infer<typeof publicPageListDto>;

export const publicPageDto = z.strictObject({
  slug: z.string(),
  title: z.string(),
  body: richTextDocSchema,
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  /** The language actually served (the default one when the requested one has no translation). */
  locale: z.string(),
  /** Slug of the page in every language it has, for `hreflang`. */
  alternates: z.record(z.string(), z.string()),
});
export type PublicPageDto = z.infer<typeof publicPageDto>;
