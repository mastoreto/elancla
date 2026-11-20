import type { PublicPostDto } from "@ancla/contracts";
import { buildToc, pickRelated, readingStats, urlDate } from "../../../blog";
import type { PublicBlogContext, ServedBlogEntry } from "../../types";
import { toPublicBlogBody } from "../toPublicBlogBody";
import { byNewest } from "../toPublicBlogIndexDto";
import { toPublicPostAuthorDto } from "../toPublicPostAuthorDto";
import {
  categoryRefOf,
  toPublicCover,
  toPublicPostSummaryDto,
} from "../toPublicPostSummaryDto";
import { toPublicSeriesDto } from "../toPublicSeriesDto";

interface PostInput {
  entry: ServedBlogEntry;
  /** Every published post (visible and scheduled), served in the same language. */
  entries: readonly ServedBlogEntry[];
  ctx: PublicBlogContext;
}

/**
 * The post page: the JSON body (the web renders it) plus everything calculated from the other
 * posts. Previous and next are the visible posts right before and after it in time.
 */
export function toPublicPostDto({
  entry,
  entries,
  ctx,
}: PostInput): PublicPostDto {
  const { snapshot, translation } = entry;
  const visible = entries.filter((other) => other.visible).sort(byNewest);
  const summaryOf = (other: ServedBlogEntry) =>
    toPublicPostSummaryDto(other, ctx);
  const position = visible.findIndex((other) => other.postId === entry.postId);
  const newer = visible[position - 1];
  const older = visible[position + 1];

  const candidateOf = (other: ServedBlogEntry) => ({
    id: other.postId,
    seriesId: other.snapshot.seriesId ?? null,
    categoryId: other.snapshot.categoryId,
    tags: other.translation.tags,
    displayedAt: other.displayedAt,
  });
  const relatedIds = pickRelated({
    current: { ...candidateOf(entry), relatedPostIds: snapshot.relatedPostIds },
    candidates: visible.map(candidateOf),
  });
  const visibleById = new Map(visible.map((other) => [other.postId, other]));

  const seriesRow = snapshot.seriesId
    ? ctx.series.get(snapshot.seriesId)
    : undefined;
  const seriesMembers = entries.filter(
    (other) =>
      snapshot.seriesId && other.snapshot.seriesId === snapshot.seriesId,
  );
  const stats = readingStats(translation.body);
  const articleCount = visible.filter(
    (other) => other.snapshot.authorProfileId === snapshot.authorProfileId,
  ).length;

  return {
    slug: translation.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    seoTitle: translation.seoTitle ?? null,
    seoDescription: translation.seoDescription ?? null,
    locale: entry.locale,
    urlDate: urlDate(entry.firstLiveAt, ctx.timeZone),
    publishedAt: entry.displayedAt.toISOString(),
    modifiedAt: entry.revisionPublishedAt?.toISOString() ?? null,
    writtenAt: snapshot.writtenAt,
    issue: ctx.issues.get(entry.postId) ?? 1,
    readingMinutes: stats.readingMinutes,
    wordCount: stats.wordCount,
    toc: buildToc(translation.body),
    body: toPublicBlogBody(translation.body, ctx.images),
    tags: translation.tags,
    cover: toPublicCover(snapshot.cover, ctx),
    category: categoryRefOf(snapshot.categoryId, ctx),
    author: toPublicPostAuthorDto(snapshot.authorProfileId, articleCount, ctx),
    series: seriesRow
      ? toPublicSeriesDto(seriesRow, seriesMembers, ctx, entry.postId)
      : null,
    related: relatedIds.flatMap((id) => {
      const related = visibleById.get(id);
      return related ? [summaryOf(related)] : [];
    }),
    previous: older ? summaryOf(older) : null,
    next: newer ? summaryOf(newer) : null,
    alternates: Object.fromEntries(
      Object.entries(snapshot.translations).map(([locale, value]) => [
        locale,
        value.slug,
      ]),
    ),
  };
}
