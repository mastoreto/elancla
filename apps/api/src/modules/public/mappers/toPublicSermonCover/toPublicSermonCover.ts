import type {
  PublicBlogImageDto,
  PublicSermonCoverDto,
} from "@ancla/contracts";

/** An own cover with no ready image (still processing, no webp) counts as no cover. */
export function toPublicImageCover(
  images: readonly PublicBlogImageDto[] | undefined,
): PublicSermonCoverDto | null {
  return images && images.length > 0
    ? { kind: "image", images: [...images] }
    : null;
}

/**
 * The picture of a sermon: its own cover when it has a ready one, otherwise the thumbnail the
 * platform gave the video, otherwise nothing.
 */
export function toPublicSermonCover(input: {
  ownImages: readonly PublicBlogImageDto[] | undefined;
  thumbnailUrl: string | null;
}): PublicSermonCoverDto | null {
  const own = toPublicImageCover(input.ownImages);
  if (own) return own;
  return input.thumbnailUrl
    ? { kind: "thumbnail", url: input.thumbnailUrl }
    : null;
}
