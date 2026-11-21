/** One width variant of a photo, as the public API sends it. */
export interface PersonPhoto {
  url: string;
  width: number;
  height?: number;
}

export interface PhotoSources {
  /** Fallback `src`: the largest variant. */
  src: string;
  srcset: string;
}

/** `srcset` (by width) of a photo's variants (people, ministry leaders); `null` when there is no photo. */
export function buildPhotoSrcSet(
  photo: readonly PersonPhoto[] | null
): PhotoSources | null {
  if (!photo || photo.length === 0) return null;
  const byWidth = [...photo].sort((a, b) => a.width - b.width);
  return {
    src: byWidth[byWidth.length - 1].url,
    srcset: byWidth
      .map((variant) => `${variant.url} ${variant.width}w`)
      .join(', '),
  };
}
