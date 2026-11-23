import { SERMON_SERIES_ORDER_MAX } from "@ancla/contracts";

export interface SeriesPlaylist {
  playlistId: string;
  /** Its public videos, in playlist order. */
  videoIds: readonly string[];
}

export interface SeriesPlacement {
  playlistId: string;
  /** Position the sermon takes in the series. */
  order: number;
}

/**
 * Which series each new sermon goes into, and at which position. The playlists are read in the
 * order given: a video that is in several keeps the first one (a sermon has one series), and the
 * positions follow the playlist order, starting at `firstOrderByPlaylist` (1 for a new series, one
 * past the highest in use for an existing one) and capped at the contract maximum.
 */
export function assignSeriesPlaylists(
  newVideoIds: ReadonlySet<string>,
  playlists: readonly SeriesPlaylist[],
  firstOrderByPlaylist: ReadonlyMap<string, number>,
): Map<string, SeriesPlacement> {
  const placements = new Map<string, SeriesPlacement>();
  for (const { playlistId, videoIds } of playlists) {
    let order = firstOrderByPlaylist.get(playlistId) ?? 1;
    for (const videoId of videoIds) {
      if (!newVideoIds.has(videoId) || placements.has(videoId)) continue;
      placements.set(videoId, { playlistId, order });
      order = Math.min(order + 1, SERMON_SERIES_ORDER_MAX);
    }
  }
  return placements;
}
