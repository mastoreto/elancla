/** What the platform says about one video (a superset of `platformLookupDto` / `platformLinkDto`). */
export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  /** ISO 8601 instant the video was published. */
  publishedAt: string;
  /** `null` when the owner hides the counter. */
  viewCount: number | null;
}

/** A recent upload, enough to choose from (`platformSuggestionDto`). */
export interface VideoSummary {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  publishedAt: string;
}

/** A playlist, enough to preload a sermon series from it. */
export interface PlaylistInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
}

/** A playlist of a channel, enough to decide whether it is a series (`listChannelPlaylists`). */
export interface ChannelPlaylistSummary {
  id: string;
  title: string;
  /** How many videos the platform counts in it (private ones included). */
  videoCount: number;
}

export interface LiveStream {
  videoId: string;
  title: string;
}

/** `getVideo` answers these instead of throwing: they are expected outcomes, not failures. */
export type VideoLookupFailure = "not_found" | "private";

/** Largest batch `getVideos` accepts (the platform's own limit per request). */
export const MAX_VIDEOS_PER_BATCH = 50;

/** Most items `listPlaylistVideos` and `listChannelPlaylists` return, however many are asked for. */
export const MAX_LISTED_ITEMS = 500;

/**
 * A video platform seen from the CRM. Transport failures (network, quota, bad key) throw
 * `PlatformRequestError`; the expected outcomes are in the return values.
 * ponytail: add PodcastPlatform with the Spotify RSS adapter
 */
export interface VideoPlatform {
  readonly platform: "youtube";
  /** The id inside a pasted URL or a bare id; `null` when the input is neither. */
  parseVideoId(input: string): string | null;
  /** The id inside a pasted playlist URL or a bare id; `null` when the input is neither. */
  parsePlaylistId(input: string): string | null;
  getVideo(id: string): Promise<VideoInfo | VideoLookupFailure>;
  /**
   * Up to `MAX_VIDEOS_PER_BATCH` ids (throws `RangeError` above). Missing ones are omitted and
   * the order follows `ids`.
   */
  getVideos(ids: readonly string[]): Promise<VideoInfo[]>;
  /** Newest first, public videos only, at most `max` (capped at `MAX_VIDEOS_PER_BATCH`). */
  listRecentUploads(channelId: string, max: number): Promise<VideoSummary[]>;
  /** `"not_found"` when the playlist does not exist or is private. */
  getPlaylist(id: string): Promise<PlaylistInfo | "not_found">;
  /**
   * The public videos of a playlist in playlist order, at most `max` (capped at
   * `MAX_LISTED_ITEMS`). Follows the platform's pages, so it costs one quota unit per 50 videos.
   * A playlist that does not exist or is private throws `PlatformRequestError` (404).
   */
  listPlaylistVideos(playlistId: string, max: number): Promise<VideoSummary[]>;
  /**
   * The public playlists of a channel, at most `max` (capped at `MAX_LISTED_ITEMS`), one quota
   * unit per 50. A channel id that is not one yields an empty list without a request.
   */
  listChannelPlaylists(
    channelId: string,
    max: number,
  ): Promise<ChannelPlaylistSummary[]>;
  /** The stream on air right now, or `null`. */
  getLiveStream(channelId: string): Promise<LiveStream | null>;
}
