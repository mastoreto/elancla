import type { PublicPerson } from '@ancla/content';

export type PersonPhoto = NonNullable<PublicPerson['photo']>[number];

export interface PhotoSources {
  /** Fallback `src`: the largest variant. */
  src: string;
  srcset: string;
}

/** `srcset` (by width) of a person's photo variants; `null` when there is no photo. */
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
