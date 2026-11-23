import type {
  PublicSermonPassageDto,
  PublicSermonPreacherDto,
  PublicSermonSeriesRefDto,
  PublicSermonSummaryDto,
  SermonPassage,
} from "@ancla/contracts";
import { pickLocalizedValue } from "../../domain";
import type { PublicSermonContext, ServedSermonEntry } from "../../types";
import { toPublicSermonCover } from "../toPublicSermonCover";

export function toPublicSermonPassages(
  passages: readonly SermonPassage[],
): PublicSermonPassageDto[] {
  return passages.map((passage) => ({
    book: passage.book,
    chapter: passage.chapter,
    verseFrom: passage.verseFrom ?? null,
    chapterTo: passage.chapterTo ?? null,
    verseTo: passage.verseTo ?? null,
  }));
}

/** `null` when the sermon has no preacher or the profile is gone. */
export function toPublicSermonPreacher(
  { snapshot }: ServedSermonEntry,
  ctx: PublicSermonContext,
): PublicSermonPreacherDto | null {
  const name = snapshot.preacherProfileId
    ? ctx.preachers.get(snapshot.preacherProfileId)
    : undefined;
  return name === undefined ? null : { name };
}

/** `null` when the sermon is outside a series or the series was deleted. */
export function toPublicSermonSeriesRef(
  { snapshot }: ServedSermonEntry,
  ctx: PublicSermonContext,
): PublicSermonSeriesRefDto | null {
  const row = snapshot.seriesId ? ctx.series.get(snapshot.seriesId) : undefined;
  if (!row || snapshot.seriesOrder === undefined) return null;
  return {
    slug: pickLocalizedValue(row.translations, ctx, (t) => t.slug) ?? "",
    title: pickLocalizedValue(row.translations, ctx, (t) => t.title) ?? "",
    order: snapshot.seriesOrder,
  };
}

export function toPublicSermonCoverOf(
  { snapshot, link }: ServedSermonEntry,
  ctx: PublicSermonContext,
): ReturnType<typeof toPublicSermonCover> {
  return toPublicSermonCover({
    ownImages: snapshot.coverMediaId
      ? ctx.covers.get(snapshot.coverMediaId)
      : undefined,
    thumbnailUrl: link.thumbnailUrl,
  });
}

/** Explicit field list: no id (sermon, series, preacher, media) leaves through the public API. */
export function toPublicSermonSummaryDto(
  entry: ServedSermonEntry,
  ctx: PublicSermonContext,
): PublicSermonSummaryDto {
  const { snapshot, translation, link } = entry;
  return {
    slug: translation.slug,
    title: translation.title,
    summary: translation.summary ?? null,
    locale: entry.locale,
    preachedOn: snapshot.preachedOn,
    videoId: link.externalId,
    durationSeconds: link.durationSeconds,
    cover: toPublicSermonCoverOf(entry, ctx),
    series: toPublicSermonSeriesRef(entry, ctx),
    preacher: toPublicSermonPreacher(entry, ctx),
    passages: toPublicSermonPassages(snapshot.passages),
    tags: translation.tags,
  };
}
