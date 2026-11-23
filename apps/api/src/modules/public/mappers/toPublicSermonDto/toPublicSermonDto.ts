import type {
  PublicSermonAttachmentDto,
  PublicSermonDto,
} from "@ancla/contracts";
import type { PublicSermonContext, ServedSermonEntry } from "../../types";
import {
  toPublicSermonCoverOf,
  toPublicSermonPassages,
  toPublicSermonPreacher,
  toPublicSermonSeriesRef,
  toPublicSermonSummaryDto,
} from "../toPublicSermonSummaryDto";

interface SermonInput {
  entry: ServedSermonEntry;
  /** Every published sermon, served in the same language. */
  entries: readonly ServedSermonEntry[];
  attachments: PublicSermonAttachmentDto[];
  ctx: PublicSermonContext;
}

/** The sermons of a series in series order (the same order twice is broken by id). */
function seriesMembersOf(
  entry: ServedSermonEntry,
  entries: readonly ServedSermonEntry[],
): ServedSermonEntry[] {
  const { seriesId } = entry.snapshot;
  if (!seriesId) return [];
  return entries
    .filter((other) => other.snapshot.seriesId === seriesId)
    .sort(
      (a, b) =>
        (a.snapshot.seriesOrder ?? 0) - (b.snapshot.seriesOrder ?? 0) ||
        a.sermonId.localeCompare(b.sermonId),
    );
}

/** The sermon page: the sermon itself plus its neighbours inside the series. */
export function toPublicSermonDto({
  entry,
  entries,
  attachments,
  ctx,
}: SermonInput): PublicSermonDto {
  const { snapshot, translation, link } = entry;
  const members = seriesMembersOf(entry, entries);
  const position = members.findIndex(
    (member) => member.sermonId === entry.sermonId,
  );
  const previous = position > 0 ? members[position - 1] : undefined;
  const next = position >= 0 ? members[position + 1] : undefined;
  return {
    slug: translation.slug,
    title: translation.title,
    summary: translation.summary ?? null,
    seoTitle: translation.seoTitle ?? null,
    seoDescription: translation.seoDescription ?? null,
    locale: entry.locale,
    preachedOn: snapshot.preachedOn,
    videoId: link.externalId,
    durationSeconds: link.durationSeconds,
    uploadedAt: link.platformPublishedAt?.toISOString() ?? null,
    modifiedAt: entry.revisionPublishedAt?.toISOString() ?? null,
    cover: toPublicSermonCoverOf(entry, ctx),
    preacher: toPublicSermonPreacher(entry, ctx),
    passages: toPublicSermonPassages(snapshot.passages),
    tags: translation.tags,
    preacherNotes: translation.preacherNotes ?? null,
    outline: translation.outline ?? null,
    attachments,
    series: toPublicSermonSeriesRef(entry, ctx),
    previous: previous ? toPublicSermonSummaryDto(previous, ctx) : null,
    next: next ? toPublicSermonSummaryDto(next, ctx) : null,
    alternates: Object.fromEntries(
      Object.entries(snapshot.translations).map(([locale, value]) => [
        locale,
        value.slug,
      ]),
    ),
  };
}
