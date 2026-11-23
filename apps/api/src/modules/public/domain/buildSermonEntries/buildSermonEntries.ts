import type { SermonSnapshot } from "@ancla/contracts";

/** What the editorial module hands over for a published revision. */
export interface LiveSermonRevision {
  entityId: string;
  snapshot: Record<string, unknown>;
  publishedAt: Date | null;
}

/** What the platform says about a video, as far as the public side reads it. */
export interface SermonPlatformData {
  externalId: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  platformPublishedAt: Date | null;
}

/** A published sermon with its video. */
export interface SermonEntry {
  sermonId: string;
  snapshot: SermonSnapshot;
  link: SermonPlatformData;
  /** When the live revision was published, for `modifiedAt`. */
  revisionPublishedAt: Date | null;
}

/**
 * The published revisions as entries. A sermon with no video link cannot be shown (the video is
 * its identity), so it is left out.
 */
export function buildSermonEntries(
  revisions: readonly LiveSermonRevision[],
  linksBySermon: ReadonlyMap<string, SermonPlatformData>,
): SermonEntry[] {
  return revisions.flatMap((revision): SermonEntry[] => {
    const link = linksBySermon.get(revision.entityId);
    if (!link) return [];
    return [
      {
        sermonId: revision.entityId,
        snapshot: revision.snapshot as unknown as SermonSnapshot,
        link,
        revisionPublishedAt: revision.publishedAt,
      },
    ];
  });
}
