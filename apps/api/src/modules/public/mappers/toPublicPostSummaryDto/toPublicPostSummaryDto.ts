import type {
  BlogCover,
  PublicBlogCoverDto,
  PublicPostSummaryDto,
} from "@ancla/contracts";
import { readingStats, urlDate } from "../../../blog";
import { pickLocalizedValue } from "../../domain";
import type { PublicBlogContext, ServedBlogEntry } from "../../types";

/** The category the site shows: slug and name in the served language. */
export function categoryRefOf(
  categoryId: string,
  ctx: PublicBlogContext,
): PublicPostSummaryDto["category"] {
  const translations = ctx.categories.get(categoryId)?.translations ?? [];
  return {
    slug: pickLocalizedValue(translations, ctx, (row) => row.slug) ?? "",
    name: pickLocalizedValue(translations, ctx, (row) => row.name) ?? "",
  };
}

/** `null` when a photo cover is not ready: the site then draws its default cover. */
export function toPublicCover(
  cover: BlogCover,
  ctx: PublicBlogContext,
): PublicBlogCoverDto | null {
  if (cover.kind === "design") return cover;
  const image = ctx.images.get(cover.mediaId);
  return image ? { kind: "photo", alt: cover.alt, image } : null;
}

/** Explicit field list: no id (post, category, author, media) leaves through the public API. */
export function toPublicPostSummaryDto(
  entry: ServedBlogEntry,
  ctx: PublicBlogContext,
): PublicPostSummaryDto {
  const { snapshot, translation } = entry;
  return {
    slug: translation.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    locale: entry.locale,
    urlDate: urlDate(entry.firstLiveAt, ctx.timeZone),
    publishedAt: entry.displayedAt.toISOString(),
    issue: ctx.issues.get(entry.postId) ?? 1,
    readingMinutes: readingStats(translation.body).readingMinutes,
    category: categoryRefOf(snapshot.categoryId, ctx),
    authorName: ctx.authors.get(snapshot.authorProfileId)?.name ?? "",
    tags: translation.tags,
    cover: toPublicCover(snapshot.cover, ctx),
  };
}
