import {
  BIBLE_BOOKS,
  type PublicSermonBookCountDto,
  type PublicSermonIndexDto,
  type PublicSermonPreacherCountDto,
  type PublicSermonSeriesDto,
} from "@ancla/contracts";
import { summarizeSeries } from "../../../sermons";
import { pickLocalizedValue } from "../../domain";
import type { PublicSermonContext, ServedSermonEntry } from "../../types";
import { webpVariantsOf } from "../toPublicBlogImages";
import { toPublicImageCover } from "../toPublicSermonCover";
import { toPublicSermonSummaryDto } from "../toPublicSermonSummaryDto";

/** Newest preached first; the id (time ordered) keeps the order stable on a tie. */
export const byNewestPreached = (
  a: ServedSermonEntry,
  b: ServedSermonEntry,
): number =>
  b.snapshot.preachedOn.localeCompare(a.snapshot.preachedOn) ||
  b.sermonId.localeCompare(a.sermonId);

function seriesOf(
  entries: readonly ServedSermonEntry[],
  ctx: PublicSermonContext,
): PublicSermonSeriesDto[] {
  const summaries = summarizeSeries(entries.map(({ snapshot }) => snapshot));
  return [...ctx.series.values()].flatMap((row) => {
    const summary = summaries.get(row.id);
    if (!summary) return [];
    return [
      {
        slug: pickLocalizedValue(row.translations, ctx, (t) => t.slug) ?? "",
        title: pickLocalizedValue(row.translations, ctx, (t) => t.title) ?? "",
        description: pickLocalizedValue(
          row.translations,
          ctx,
          (t) => t.description,
        ),
        cover: toPublicImageCover(
          webpVariantsOf(row.coverMedia, ctx.publicBaseUrl),
        ),
        count: summary.sermonCount,
        firstPreachedOn: summary.firstPreachedOn,
        lastPreachedOn: summary.lastPreachedOn,
      },
    ];
  });
}

function preachersOf(
  entries: readonly ServedSermonEntry[],
  ctx: PublicSermonContext,
): PublicSermonPreacherCountDto[] {
  const counts = new Map<string, number>();
  for (const { snapshot } of entries) {
    const name = snapshot.preacherProfileId
      ? ctx.preachers.get(snapshot.preacherProfileId)
      : undefined;
    if (name !== undefined) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Books cited by at least one sermon (once per sermon), in canonical order. */
function booksOf(
  entries: readonly ServedSermonEntry[],
): PublicSermonBookCountDto[] {
  const counts = new Map<string, number>();
  for (const { snapshot } of entries) {
    for (const book of new Set(snapshot.passages.map((p) => p.book))) {
      counts.set(book, (counts.get(book) ?? 0) + 1);
    }
  }
  return BIBLE_BOOKS.flatMap(({ code }) => {
    const count = counts.get(code);
    return count === undefined ? [] : [{ book: code, count }];
  });
}

interface IndexInput {
  /** Every published sermon, in the language it is served in. */
  entries: readonly ServedSermonEntry[];
  ctx: PublicSermonContext;
}

export function toPublicSermonIndexDto({
  entries,
  ctx,
}: IndexInput): PublicSermonIndexDto {
  const sorted = [...entries].sort(byNewestPreached);
  const summaries = sorted.map((entry) => toPublicSermonSummaryDto(entry, ctx));
  const featuredIndex = sorted.findIndex(({ snapshot }) => snapshot.featured);
  return {
    locale: ctx.locale,
    sermons: summaries,
    featured: summaries[Math.max(featuredIndex, 0)] ?? null,
    series: seriesOf(sorted, ctx),
    preachers: preachersOf(sorted, ctx),
    books: booksOf(sorted),
  };
}
