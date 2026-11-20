import type { MediaFileDto } from "@ancla/contracts";

/** The lightest webp variant: enough for an avatar, cheap to load. */
export function photoThumbnailUrl(photo: MediaFileDto | null): string | null {
  if (!photo) return null;
  const smallest = photo.variants
    .filter((variant) => variant.format === "webp")
    .sort((a, b) => a.width - b.width)[0];
  return smallest?.url ?? null;
}
