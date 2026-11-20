import { z } from "zod";
import {
  RICH_TEXT_HREF_MAX_LENGTH,
  richTextBlockSchema,
  richTextBoundedInput,
  richTextInlineSchema,
  richTextParagraphSchema,
} from "../../common";

export const BLOG_FIGURE_ASPECTS = ["landscape", "wide", "square"] as const;
export const BLOG_VERSE_REFERENCE_MAX_LENGTH = 80;
export const BLOG_FIGURE_ALT_MAX_LENGTH = 300;
export const BLOG_CAPTION_MAX_LENGTH = 300;
export const BLOG_PULLQUOTE_CITE_MAX_LENGTH = 120;
export const BLOG_VIDEO_TITLE_MAX_LENGTH = 140;
export const BLOG_NOTE_LABEL_MAX_LENGTH = 40;
export const BLOG_LINK_CARDS_MAX_ITEMS = 6;
export const BLOG_LINK_CARD_TITLE_MAX_LENGTH = 120;
export const BLOG_LINK_CARD_DESCRIPTION_MAX_LENGTH = 240;
export const BLOG_LINK_CARD_SOURCE_MAX_LENGTH = 60;

/** A YouTube video id. Anything else (a URL, markup) never reaches the iframe `src`. */
export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
/** Link cards point outside the site: only http(s) (no `mailto:`, unlike inline links). */
export const BLOG_LINK_CARD_HREF_PATTERN = /^https?:\/\//i;

// The editor emits `null` for attributes left empty; they are stored as absent.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : undefined));

const paragraphNode = z.object({
  type: z.literal("paragraph"),
  attrs: z.object({ dropCap: z.boolean().nullish() }).optional(),
  content: z.array(richTextInlineSchema).optional(),
});

const verseNode = z.object({
  type: z.literal("verse"),
  attrs: z.object({
    reference: z.string().trim().min(1).max(BLOG_VERSE_REFERENCE_MAX_LENGTH),
  }),
  content: z.array(richTextInlineSchema).optional(),
});

const pullquoteNode = z.object({
  type: z.literal("pullquote"),
  attrs: z
    .object({ cite: optionalText(BLOG_PULLQUOTE_CITE_MAX_LENGTH) })
    .optional(),
  content: z.array(richTextInlineSchema).optional(),
});

const noteNode = z.object({
  type: z.literal("note"),
  attrs: z.object({
    label: z.string().trim().min(1).max(BLOG_NOTE_LABEL_MAX_LENGTH),
  }),
  content: z.array(richTextParagraphSchema),
});

const videoNode = z.object({
  type: z.literal("video"),
  attrs: z.object({
    youtubeId: z.string().regex(YOUTUBE_ID_PATTERN),
    title: z.string().trim().min(1).max(BLOG_VIDEO_TITLE_MAX_LENGTH),
    caption: optionalText(BLOG_CAPTION_MAX_LENGTH),
  }),
});

const linkCardsNode = z.object({
  type: z.literal("linkCards"),
  attrs: z.object({
    items: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(BLOG_LINK_CARD_TITLE_MAX_LENGTH),
          description: optionalText(BLOG_LINK_CARD_DESCRIPTION_MAX_LENGTH),
          href: z
            .string()
            .max(RICH_TEXT_HREF_MAX_LENGTH)
            .regex(BLOG_LINK_CARD_HREF_PATTERN),
          sourceLabel: optionalText(BLOG_LINK_CARD_SOURCE_MAX_LENGTH),
        }),
      )
      .min(1)
      .max(BLOG_LINK_CARDS_MAX_ITEMS),
  }),
});

const figureTextAttrs = {
  alt: z.string().trim().max(BLOG_FIGURE_ALT_MAX_LENGTH),
  caption: optionalText(BLOG_CAPTION_MAX_LENGTH),
  aspect: z.enum(BLOG_FIGURE_ASPECTS),
};

/** The figure as the editor stores it: the image is a media file of the organization. */
const figureNode = z.object({
  type: z.literal("figure"),
  attrs: z.object({ mediaId: z.uuid(), ...figureTextAttrs }),
});

/** The figure as the public API serves it: the media id became the image variant to show. */
export const publicBlogImageDto = z.strictObject({
  url: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type PublicBlogImageDto = z.infer<typeof publicBlogImageDto>;

const publicFigureNode = z.object({
  type: z.literal("figure"),
  attrs: z.object({ image: publicBlogImageDto, ...figureTextAttrs }),
});

/*
 * The blog body is the base document plus its own nodes. The new nodes are top-level only: the
 * base blocks keep nesting among themselves (a blockquote or a list holds base blocks), and the
 * paragraph with a drop cap comes first so `dropCap` survives instead of being stripped by the
 * base paragraph. Depth, node and text limits are the base ones (`richTextBoundedInput`).
 */
function buildBlogDocSchema<Figure extends z.ZodType>(figure: Figure) {
  const blogBlock = z.union([
    paragraphNode,
    verseNode,
    figure,
    pullquoteNode,
    videoNode,
    noteNode,
    linkCardsNode,
    richTextBlockSchema,
  ]);
  return richTextBoundedInput.pipe(
    z.object({ type: z.literal("doc"), content: z.array(blogBlock) }),
  );
}

export const blogRichTextDocSchema = buildBlogDocSchema(figureNode);
export type BlogRichTextDoc = z.infer<typeof blogRichTextDocSchema>;

/** Same document with the figures resolved; what `GET posts/:slug` returns as `body`. */
export const publicBlogRichTextDocSchema = buildBlogDocSchema(publicFigureNode);
export type PublicBlogRichTextDoc = z.infer<typeof publicBlogRichTextDocSchema>;
