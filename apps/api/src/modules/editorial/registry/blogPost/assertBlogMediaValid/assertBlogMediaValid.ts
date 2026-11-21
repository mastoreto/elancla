import type { BlogPostSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { assertMediaValid } from "../../media";

interface NodeLike {
  type?: string;
  attrs?: { mediaId?: unknown };
  content?: readonly NodeLike[];
}

function figureMediaIds(node: NodeLike): string[] {
  const own =
    node.type === "figure" && typeof node.attrs?.mediaId === "string"
      ? [node.attrs.mediaId]
      : [];
  return [...own, ...(node.content ?? []).flatMap(figureMediaIds)];
}

/** Every media file the post points at: the cover photo and the figures of every language. */
export function collectBlogMediaIds(
  snapshot: Record<string, unknown>,
): string[] {
  const { cover, translations } = snapshot as BlogPostSnapshot;
  const ids = [
    ...(cover.kind === "photo" ? [cover.mediaId] : []),
    ...Object.values(translations).flatMap((translation) =>
      figureMediaIds(translation.body as NodeLike),
    ),
  ];
  return [...new Set(ids)];
}

/** Images of the post must be finished content images of the organization (400 `invalid_media`). */
export async function assertBlogMediaValid(
  context: GoLiveContext,
): Promise<void> {
  await assertMediaValid(
    context,
    collectBlogMediaIds(context.snapshot),
    "The cover and the figures must be finished content images of the organization",
  );
}
