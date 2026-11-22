import { z } from "zod";
import { publicBlogImageDto } from "../blog/blogRichText";
import { richTextDocSchema } from "../common";
import { publicLocaleQuery } from "../public/publicSiteSettingsDto";
import { landingTone, ministryColor, ministryIcon } from "./ministryDto";

/*
 * Public ministries contract (`/public/v1`). Deliberately no ids of any kind (ministries,
 * categories, people, media). `.strict()` everywhere: it is public and versioned.
 */

export const publicMinistriesQuery = publicLocaleQuery;
export const publicMinistryQuery = publicLocaleQuery;

/**
 * `slug` is present only when the ministry has a page of its own; `href` is the destination of its
 * links (the page, the external URL) and absent when it has none.
 */
export const publicMinistrySummaryDto = z.strictObject({
  name: z.string(),
  slug: z.string().optional(),
  href: z.string().optional(),
  tagline: z.string(),
  icon: ministryIcon.optional(),
  color: ministryColor,
  category: z.string().optional(),
});
export type PublicMinistrySummaryDto = z.infer<typeof publicMinistrySummaryDto>;

export const publicLandingTileDto = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("color"), tone: landingTone }),
  z.strictObject({ kind: z.literal("photo"), image: publicBlogImageDto }),
]);
export type PublicLandingTileDto = z.infer<typeof publicLandingTileDto>;

export const publicLandingEntryDto = z.strictObject({
  name: z.string(),
  href: z.string().optional(),
  tile: publicLandingTileDto,
});
export type PublicLandingEntryDto = z.infer<typeof publicLandingEntryDto>;

/** `GET ministries`: the visible ministries and the ordered landing mosaic. */
export const publicMinistriesDto = z.strictObject({
  ministries: z.array(publicMinistrySummaryDto),
  landing: z.array(publicLandingEntryDto),
});
export type PublicMinistriesDto = z.infer<typeof publicMinistriesDto>;

export const publicMinistryLeaderDto = z.strictObject({
  name: z.string(),
  title: z.string(),
  photo: z.array(publicBlogImageDto).optional(),
  bio: z.string().optional(),
});
export type PublicMinistryLeaderDto = z.infer<typeof publicMinistryLeaderDto>;

/** One weekly slot of a ministry. `weekday` follows `Date#getDay` (0 = Sunday); hours are `HH:mm`. */
export const publicMinistryScheduleSlotDto = z.strictObject({
  weekday: z.number().int().min(0).max(6),
  start: z.string(),
  end: z.string().optional(),
});
export type PublicMinistryScheduleSlotDto = z.infer<
  typeof publicMinistryScheduleSlotDto
>;

/** `GET ministries/:slug`: the body is the JSON document (the web renders it), not HTML. */
export const publicMinistryDto = z.strictObject({
  /** The language actually served (the default one when the requested one has no translation). */
  locale: z.string(),
  name: z.string(),
  slug: z.string(),
  tagline: z.string(),
  about: richTextDocSchema,
  values: z.array(
    z.strictObject({ title: z.string(), description: z.string() }),
  ),
  place: z.string().optional(),
  audience: z.string().optional(),
  howToJoin: z.string().optional(),
  nextStep: z.string().optional(),
  icon: ministryIcon.optional(),
  color: ministryColor,
  leaders: z.array(publicMinistryLeaderDto),
  /** When the ministry meets this week: its public linked activities, in the church time zone. */
  schedule: z.array(publicMinistryScheduleSlotDto),
  cover: z
    .strictObject({ alt: z.string().optional(), image: publicBlogImageDto })
    .optional(),
  /** Resolved: `seoTitle ?? name`, `seoDescription ?? tagline`, `socialImage ?? cover`. */
  seo: z.strictObject({
    title: z.string(),
    description: z.string(),
    image: publicBlogImageDto.optional(),
  }),
  /** Slug of the ministry in every language it has, for `hreflang`. */
  alternates: z.record(z.string(), z.string()),
});
export type PublicMinistryDto = z.infer<typeof publicMinistryDto>;
