/** The slice of YouTube Data API v3 responses the adapter reads. */
export type YoutubeThumbnails = Record<string, { url: string } | undefined>;

type YoutubePrivacyStatus = "public" | "unlisted" | "private";

export interface YoutubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails?: YoutubeThumbnails;
    liveBroadcastContent?: "none" | "live" | "upcoming";
  };
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
  status?: { privacyStatus?: YoutubePrivacyStatus };
}

export interface YoutubePlaylistItem {
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails?: YoutubeThumbnails;
  };
  contentDetails: { videoId: string; videoPublishedAt?: string };
  status?: { privacyStatus?: YoutubePrivacyStatus };
}

export interface YoutubePlaylistResource {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails?: YoutubeThumbnails;
  };
  contentDetails?: { itemCount?: number };
}

export interface YoutubeListResponse<TItem> {
  items?: TItem[];
  nextPageToken?: string;
}

/** The part of `fetch` the adapter needs, so tests can serve recorded responses. */
export type FetchLike = (input: string) => Promise<Response>;
