import { YOUTUBE_CHANNEL_ID_PATTERN } from "@ancla/contracts";
import { PlatformRequestError } from "../PlatformRequestError";
import {
  type ChannelPlaylistSummary,
  type LiveStream,
  MAX_LISTED_ITEMS,
  MAX_VIDEOS_PER_BATCH,
  type PlaylistInfo,
  type VideoInfo,
  type VideoLookupFailure,
  type VideoPlatform,
  type VideoSummary,
} from "../types";
import type {
  FetchLike,
  YoutubeListResponse,
  YoutubePlaylistItem,
  YoutubePlaylistResource,
  YoutubeThumbnails,
  YoutubeVideoItem,
} from "./types";
import {
  parseIsoDuration,
  parseYoutubePlaylistId,
  parseYoutubeVideoId,
} from "./utils";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const THUMBNAIL_SIZES = ["maxres", "standard", "high", "medium", "default"];
const VIDEO_PARTS = "snippet,contentDetails,statistics,status";
/**
 * Live detection looks at the newest uploads only: a stream on air is always among the latest few.
 */
const LIVE_LOOKUP_UPLOADS = 5;

export interface YoutubePlatformConfig {
  apiKey: string;
  fetch: FetchLike;
}

function pickThumbnail(
  thumbnails: YoutubeThumbnails | undefined,
): string | null {
  if (!thumbnails) return null;
  for (const size of THUMBNAIL_SIZES) {
    const url = thumbnails[size]?.url;
    if (url) return url;
  }
  return null;
}

/** Every channel has an uploads playlist whose id is the channel id with `UC` swapped for `UU`. */
function uploadsPlaylistId(channelId: string): string | null {
  return YOUTUBE_CHANNEL_ID_PATTERN.test(channelId)
    ? `UU${channelId.slice(2)}`
    : null;
}

function toViewCount(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const count = Number(raw);
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

function toVideoInfo(item: YoutubeVideoItem): VideoInfo {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
    durationSeconds: parseIsoDuration(item.contentDetails?.duration),
    publishedAt: item.snippet.publishedAt,
    viewCount: toViewCount(item.statistics?.viewCount),
  };
}

function toVideoSummary(item: YoutubePlaylistItem): VideoSummary {
  return {
    id: item.contentDetails.videoId,
    title: item.snippet.title,
    thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
    publishedAt:
      item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt,
  };
}

/** YouTube Data API v3 as a `VideoPlatform`. Needs an API key; talks only through `fetch`. */
export function createYoutubePlatform({
  apiKey,
  fetch,
}: YoutubePlatformConfig): VideoPlatform {
  async function requestPage<TItem>(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<YoutubeListResponse<TItem>> {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    for (const [name, value] of Object.entries({ ...params, key: apiKey })) {
      url.searchParams.set(name, value);
    }
    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch (error) {
      throw new PlatformRequestError(
        `YouTube ${endpoint} could not be reached: ${error instanceof Error ? error.message : String(error)}`,
        null,
      );
    }
    if (!response.ok) {
      throw new PlatformRequestError(
        `YouTube ${endpoint} answered ${response.status}`,
        response.status,
      );
    }
    return (await response.json()) as YoutubeListResponse<TItem>;
  }

  async function request<TItem>(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<TItem[]> {
    return (await requestPage<TItem>(endpoint, params)).items ?? [];
  }

  /**
   * Follows `nextPageToken` until `max` results are collected or the pages run out. `toResult`
   * returns `null` for the items the platform lists but we do not return (private videos). Each
   * page costs one quota unit and 50 items is the platform's page maximum.
   */
  async function collectPages<TItem, TResult>(
    endpoint: string,
    params: Record<string, string>,
    max: number,
    toResult: (item: TItem) => TResult | null,
  ): Promise<TResult[]> {
    const limit = Math.min(Math.floor(max), MAX_LISTED_ITEMS);
    const results: TResult[] = [];
    let pageToken: string | undefined;
    while (results.length < limit) {
      const page = await requestPage<TItem>(endpoint, {
        ...params,
        maxResults: String(MAX_VIDEOS_PER_BATCH),
        ...(pageToken ? { pageToken } : {}),
      });
      for (const item of page.items ?? []) {
        const result = toResult(item);
        if (result !== null) results.push(result);
      }
      pageToken = page.nextPageToken;
      if (!pageToken) break;
    }
    return results.slice(0, limit);
  }

  const fetchVideoItems = (ids: readonly string[]) =>
    request<YoutubeVideoItem>("videos", {
      part: VIDEO_PARTS,
      id: ids.join(","),
      maxResults: String(MAX_VIDEOS_PER_BATCH),
    });

  return {
    platform: "youtube",
    parseVideoId: parseYoutubeVideoId,
    parsePlaylistId: parseYoutubePlaylistId,

    async getVideo(id: string): Promise<VideoInfo | VideoLookupFailure> {
      const [item] = await fetchVideoItems([id]);
      // With a plain API key YouTube omits private videos, so they usually read as `not_found`.
      if (!item) return "not_found";
      if (item.status?.privacyStatus === "private") return "private";
      return toVideoInfo(item);
    },

    async getVideos(ids: readonly string[]): Promise<VideoInfo[]> {
      if (ids.length > MAX_VIDEOS_PER_BATCH) {
        throw new RangeError(
          `getVideos accepts at most ${MAX_VIDEOS_PER_BATCH} ids`,
        );
      }
      if (ids.length === 0) return [];
      const byId = new Map(
        (await fetchVideoItems(ids))
          .filter((item) => item.status?.privacyStatus !== "private")
          .map((item) => [item.id, toVideoInfo(item)]),
      );
      return ids.flatMap((id) => byId.get(id) ?? []);
    },

    async listRecentUploads(
      channelId: string,
      max: number,
    ): Promise<VideoSummary[]> {
      const playlistId = uploadsPlaylistId(channelId);
      const limit = Math.min(Math.floor(max), MAX_VIDEOS_PER_BATCH);
      if (!playlistId || limit < 1) return [];
      const items = await request<YoutubePlaylistItem>("playlistItems", {
        part: "snippet,contentDetails,status",
        playlistId,
        maxResults: String(limit),
      });
      return items
        .filter((item) => item.status?.privacyStatus !== "private")
        .slice(0, limit)
        .map(toVideoSummary);
    },

    listPlaylistVideos(
      playlistId: string,
      max: number,
    ): Promise<VideoSummary[]> {
      return collectPages<YoutubePlaylistItem, VideoSummary>(
        "playlistItems",
        { part: "snippet,contentDetails,status", playlistId },
        max,
        (item) =>
          item.status?.privacyStatus === "private"
            ? null
            : toVideoSummary(item),
      );
    },

    async listChannelPlaylists(
      channelId: string,
      max: number,
    ): Promise<ChannelPlaylistSummary[]> {
      if (!YOUTUBE_CHANNEL_ID_PATTERN.test(channelId)) return [];
      return collectPages<YoutubePlaylistResource, ChannelPlaylistSummary>(
        "playlists",
        { part: "snippet,contentDetails", channelId },
        max,
        (playlist) => ({
          id: playlist.id,
          title: playlist.snippet.title,
          videoCount: playlist.contentDetails?.itemCount ?? 0,
        }),
      );
    },

    async getPlaylist(id: string): Promise<PlaylistInfo | "not_found"> {
      const [playlist] = await request<YoutubePlaylistResource>("playlists", {
        part: "snippet",
        id,
      });
      if (!playlist) return "not_found";
      return {
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        thumbnailUrl: pickThumbnail(playlist.snippet.thumbnails),
      };
    },

    /**
     * `playlistItems` of the uploads playlist (1 quota unit) plus `videos` (1 unit) instead of
     * `search?eventType=live` (100 units): the uploads list is cheap and a live stream is always
     * among the newest uploads.
     */
    async getLiveStream(channelId: string): Promise<LiveStream | null> {
      const playlistId = uploadsPlaylistId(channelId);
      if (!playlistId) return null;
      const recent = await request<YoutubePlaylistItem>("playlistItems", {
        part: "contentDetails",
        playlistId,
        maxResults: String(LIVE_LOOKUP_UPLOADS),
      });
      const ids = recent.map((item) => item.contentDetails.videoId);
      if (ids.length === 0) return null;
      const videos = await request<YoutubeVideoItem>("videos", {
        part: "snippet",
        id: ids.join(","),
      });
      const live = videos.find(
        (video) => video.snippet.liveBroadcastContent === "live",
      );
      return live ? { videoId: live.id, title: live.snippet.title } : null;
    },
  };
}
