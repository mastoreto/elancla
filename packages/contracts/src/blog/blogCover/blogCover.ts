import { z } from "zod";

/** Editorial glyphs a design cover can draw. Keys, not characters: the web owns the artwork. */
export const BLOG_COVER_GLYPHS = [
  "anchor",
  "cross",
  "book",
  "dove",
  "flame",
  "lamp",
  "wheat",
  "water",
  "path",
  "bread",
] as const;
export type BlogCoverGlyph = (typeof BLOG_COVER_GLYPHS)[number];

/** Background tones of a design cover. Token keys (`--color-cover-<tint>`), never hex values. */
export const BLOG_COVER_TINTS = ["paper", "cream", "stone", "sand"] as const;
export type BlogCoverTint = (typeof BLOG_COVER_TINTS)[number];

export const BLOG_COVER_ALT_MAX_LENGTH = 200;

export const blogCoverSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("photo"),
    mediaId: z.uuid(),
    alt: z.string().trim().max(BLOG_COVER_ALT_MAX_LENGTH),
  }),
  z.strictObject({
    kind: z.literal("design"),
    glyph: z.enum(BLOG_COVER_GLYPHS),
    tint: z.enum(BLOG_COVER_TINTS),
  }),
]);
export type BlogCover = z.infer<typeof blogCoverSchema>;
