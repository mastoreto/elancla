import type { PublicSeriesDto } from "@ancla/contracts";
import { readingStats, seriesState, urlDate } from "../../../blog";
import type { PublicBlogSeriesRow } from "../../data";
import { pickLocalizedValue } from "../../domain";
import type { PublicBlogContext, ServedBlogEntry } from "../../types";

/**
 * A series with its posts in order. A scheduled member is a `next` entry: title and date only, so
 * nobody can reach it before its time. `currentPostId` marks the post being read.
 */
export function toPublicSeriesDto(
  row: PublicBlogSeriesRow,
  members: readonly ServedBlogEntry[],
  ctx: PublicBlogContext,
  currentPostId?: string,
): PublicSeriesDto {
  const items = [...members]
    .sort(
      (a, b) =>
        (a.snapshot.seriesOrder ?? 0) - (b.snapshot.seriesOrder ?? 0) ||
        a.displayedAt.getTime() - b.displayedAt.getTime(),
    )
    .map((member) => ({
      order: member.snapshot.seriesOrder ?? 0,
      title: member.translation.title,
      slug: member.visible ? member.translation.slug : null,
      urlDate: member.visible
        ? urlDate(member.firstLiveAt, ctx.timeZone)
        : null,
      publishedAt: member.displayedAt.toISOString(),
      readingMinutes: member.visible
        ? readingStats(member.translation.body).readingMinutes
        : null,
      state: seriesState(
        { postId: member.postId, visible: member.visible },
        currentPostId,
      ),
    }));
  return {
    slug: pickLocalizedValue(row.translations, ctx, (t) => t.slug) ?? "",
    name: pickLocalizedValue(row.translations, ctx, (t) => t.name) ?? "",
    description: pickLocalizedValue(
      row.translations,
      ctx,
      (t) => t.description,
    ),
    items,
  };
}
