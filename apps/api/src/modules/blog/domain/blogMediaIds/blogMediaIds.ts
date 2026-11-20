import type { BlogCover } from "@ancla/contracts";

/** The media file a cover points to (design covers have none). */
export function coverMediaId(cover: BlogCover): string[] {
  return cover.kind === "photo" ? [cover.mediaId] : [];
}

interface BodyNodeLike {
  type: string;
  attrs?: unknown;
}

/** The media files of the figures of a body (figures are top-level blocks). */
export function figureMediaIds(body: {
  content?: readonly BodyNodeLike[];
}): string[] {
  return (body.content ?? []).flatMap((node) => {
    if (node.type !== "figure") return [];
    const { mediaId } = (node.attrs ?? {}) as { mediaId?: unknown };
    return typeof mediaId === "string" ? [mediaId] : [];
  });
}
