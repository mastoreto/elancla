import type { VideoInfo } from "../../../../core/platforms";

const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=";

export const youtubeWatchUrl = (videoId: string): string =>
  `${YOUTUBE_WATCH_URL}${videoId}`;

/** The columns of `PlatformLink` that come from what YouTube says; refreshing rewrites these only. */
export interface PlatformLinkFields {
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  platformPublishedAt: Date;
  viewCount: number | null;
  fetchedAt: Date;
}

export function toPlatformLinkFields(
  video: VideoInfo,
  fetchedAt: Date,
): PlatformLinkFields {
  return {
    thumbnailUrl: video.thumbnailUrl,
    durationSeconds: video.durationSeconds,
    platformPublishedAt: new Date(video.publishedAt),
    viewCount: video.viewCount,
    fetchedAt,
  };
}
