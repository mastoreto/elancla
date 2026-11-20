import type {
  PublicBlogCategoryDto,
  PublicBlogIndexDto,
  PublicBlogTagDto,
  PublicSeriesDto,
} from "@ancla/contracts";
import { buildArchive } from "../../../blog";
import type { PublicBlogContext, ServedBlogEntry } from "../../types";
import {
  categoryRefOf,
  toPublicPostSummaryDto,
} from "../toPublicPostSummaryDto";
import { toPublicSeriesDto } from "../toPublicSeriesDto";

/** Newest first by the date the site shows; the id keeps the order stable on a tie. */
export const byNewest = (a: ServedBlogEntry, b: ServedBlogEntry): number =>
  b.displayedAt.getTime() - a.displayedAt.getTime() ||
  a.postId.localeCompare(b.postId);

function categoriesOf(
  visible: readonly ServedBlogEntry[],
  ctx: PublicBlogContext,
): PublicBlogCategoryDto[] {
  const counts = new Map<string, number>();
  for (const { snapshot } of visible) {
    counts.set(snapshot.categoryId, (counts.get(snapshot.categoryId) ?? 0) + 1);
  }
  return [...ctx.categories.values()]
    .filter((row) => counts.has(row.id))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((row) => ({
      ...categoryRefOf(row.id, ctx),
      count: counts.get(row.id) ?? 0,
    }));
}

function seriesOf(
  entries: readonly ServedBlogEntry[],
  ctx: PublicBlogContext,
): PublicSeriesDto[] {
  return [...ctx.series.values()].flatMap((row) => {
    const members = entries.filter(
      ({ snapshot }) => snapshot.seriesId === row.id,
    );
    // A series that has only scheduled posts is not announced yet.
    return members.some(({ visible }) => visible)
      ? [toPublicSeriesDto(row, members, ctx)]
      : [];
  });
}

function tagsOf(visible: readonly ServedBlogEntry[]): PublicBlogTagDto[] {
  const counts = new Map<string, number>();
  for (const { translation } of visible) {
    for (const tag of translation.tags)
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

interface IndexInput {
  /** Every published post (visible and scheduled), in the language they are served in. */
  entries: readonly ServedBlogEntry[];
  ctx: PublicBlogContext;
  /** Ids of the most read posts, in order (see `pickPopular`). */
  popularIds: readonly string[];
}

export function toPublicBlogIndexDto({
  entries,
  ctx,
  popularIds,
}: IndexInput): PublicBlogIndexDto {
  const visible = entries.filter((entry) => entry.visible).sort(byNewest);
  const summaryOf = (entry: ServedBlogEntry) =>
    toPublicPostSummaryDto(entry, ctx);
  const featured = visible.find(({ snapshot }) => snapshot.featured);
  const visibleById = new Map(visible.map((entry) => [entry.postId, entry]));
  return {
    locale: ctx.locale,
    posts: visible.map(summaryOf),
    featured: featured ? summaryOf(featured) : null,
    categories: categoriesOf(visible, ctx),
    series: seriesOf(entries, ctx),
    archive: buildArchive(
      visible.map(({ firstLiveAt }) => firstLiveAt),
      ctx.timeZone,
    ),
    popular: popularIds.flatMap((id) => {
      const entry = visibleById.get(id);
      return entry ? [summaryOf(entry)] : [];
    }),
    tags: tagsOf(visible),
  };
}
