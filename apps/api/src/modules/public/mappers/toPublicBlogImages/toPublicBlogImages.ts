import type { PublicBlogImageDto } from "@ancla/contracts";
import { buildMediaVariantUrls } from "../../../media";

interface StoredMedia {
  status: string;
  variants: unknown;
}

// ponytail: only webp is exposed (as for people photos); avif would be a second list to choose from.
/** The webp variants of a media file that is ready; empty otherwise. */
export function webpVariantsOf(
  media: StoredMedia | null | undefined,
  publicBaseUrl: string,
): PublicBlogImageDto[] {
  if (!media || media.status !== "ready") return [];
  return buildMediaVariantUrls(media.variants, publicBaseUrl)
    .filter((variant) => variant.format === "webp")
    .map(({ url, width, height }) => ({ url, width, height }));
}

/** The single image a cover or figure shows: the widest variant. `null` when it is not ready. */
export function toPublicBlogImage(
  media: StoredMedia | null | undefined,
  publicBaseUrl: string,
): PublicBlogImageDto | null {
  const [widest] = webpVariantsOf(media, publicBaseUrl).sort(
    (a, b) => b.width - a.width,
  );
  return widest ?? null;
}
