import {
  type BlogRichTextDoc,
  blogRichTextDocSchema,
  type PublicBlogImageDto,
  type PublicBlogRichTextDoc,
  publicBlogRichTextDocSchema,
} from "@ancla/contracts";

/**
 * The stored body as the public API serves it: each figure's `mediaId` becomes the image to show;
 * a figure whose media is missing or not ready is left out. Parsed on the way in and out: the
 * stored JSON is never trusted blindly.
 */
export function toPublicBlogBody(
  stored: unknown,
  images: ReadonlyMap<string, PublicBlogImageDto>,
): PublicBlogRichTextDoc {
  const doc: BlogRichTextDoc = blogRichTextDocSchema.parse(stored);
  const content = doc.content.flatMap((block): unknown[] => {
    if (block.type !== "figure") return [block];
    const { mediaId, ...text } = block.attrs;
    const image = images.get(mediaId);
    return image ? [{ type: "figure", attrs: { image, ...text } }] : [];
  });
  return publicBlogRichTextDocSchema.parse({ ...doc, content });
}
