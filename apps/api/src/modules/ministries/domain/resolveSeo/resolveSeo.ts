import type { PublicBlogImageDto } from "@ancla/contracts";

interface SeoTexts {
  name: string;
  tagline: string;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
}

interface SeoImages {
  social: PublicBlogImageDto | undefined;
  cover: PublicBlogImageDto | undefined;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  image: PublicBlogImageDto | undefined;
}

/** What the page tells search engines and social cards: the own SEO text, else the profile's. */
export function resolveSeo(
  { name, tagline, seoTitle, seoDescription }: SeoTexts,
  { social, cover }: SeoImages,
): ResolvedSeo {
  return {
    title: seoTitle ?? name,
    description: seoDescription ?? tagline,
    image: social ?? cover,
  };
}
