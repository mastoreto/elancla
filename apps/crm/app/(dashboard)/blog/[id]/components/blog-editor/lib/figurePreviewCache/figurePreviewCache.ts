import type { MediaFileDto } from "@ancla/contracts";

/*
 * The figure stores only `mediaId` (the schema forbids anything else), so the editor remembers
 * the preview URL of images uploaded in this session. A draft loaded from the server has none
 * and the node view shows a placeholder.
 */
const previewByMediaId = new Map<string, string>();

/** The lightest webp variant: enough for an editor preview. */
function smallestWebpUrl(file: MediaFileDto): string | null {
  const webp = file.variants.filter((variant) => variant.format === "webp");
  return webp.sort((a, b) => a.width - b.width)[0]?.url ?? null;
}

export function rememberFigurePreview(file: MediaFileDto): void {
  const url = smallestWebpUrl(file);
  if (url) previewByMediaId.set(file.id, url);
}

export function figurePreviewUrl(mediaId: string): string | null {
  return previewByMediaId.get(mediaId) ?? null;
}
