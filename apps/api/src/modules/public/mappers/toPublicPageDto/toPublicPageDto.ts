import {
  type PublicPageDto,
  type PublicPageSummaryDto,
  richTextDocSchema,
  type SimplePageSnapshot,
} from "@ancla/contracts";
import type { PickedPageTranslation } from "../../domain";

export function toPublicPageSummaryDto({
  translation,
}: PickedPageTranslation): PublicPageSummaryDto {
  return { slug: translation.slug, title: translation.title };
}

/** `alternates` lists the slug of every language the page has, for `hreflang`. */
export function toPublicPageDto(
  { locale, translation }: PickedPageTranslation,
  snapshot: Record<string, unknown>,
): PublicPageDto {
  const { translations } = snapshot as unknown as SimplePageSnapshot;
  return {
    slug: translation.slug,
    title: translation.title,
    // Parsed again on the way out: the stored JSON is never trusted blindly.
    body: richTextDocSchema.parse(translation.body),
    seoTitle: translation.seoTitle ?? null,
    seoDescription: translation.seoDescription ?? null,
    locale,
    alternates: Object.fromEntries(
      Object.entries(translations).map(([key, value]) => [key, value.slug]),
    ),
  };
}
