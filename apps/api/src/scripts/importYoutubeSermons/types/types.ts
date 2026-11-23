import type { VideoPlatform } from "../../../core/platforms";

export interface SermonImportOptions {
  organizationSlug: string;
  /** The sermons playlist: a pasted URL or a bare playlist id. */
  playlist: string;
  /** Reads and reports; writes nothing. */
  dryRun: boolean;
  platform: VideoPlatform;
}

export interface ImportedSeries {
  playlistId: string;
  title: string;
}

export interface ImportedSermon {
  videoId: string;
  title: string;
  /** The playlist of the series the sermon goes into, if any. */
  seriesPlaylistId: string | null;
}

export type SkipReason = "already_linked" | "unavailable";

export interface SkippedVideo {
  videoId: string;
  reason: SkipReason;
}

/** What the run did (or, in a dry run, would do). */
export interface SermonImportReport {
  dryRun: boolean;
  playlistTitle: string;
  /** Series created from channel playlists that had none. */
  seriesCreated: ImportedSeries[];
  /** Series that already existed for a channel playlist and were reused. */
  seriesReused: ImportedSeries[];
  sermonsImported: ImportedSermon[];
  sermonsSkipped: SkippedVideo[];
  /** The playlist has more videos than one run reads: run again after importing, or split it. */
  truncated: boolean;
}
