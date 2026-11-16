export type PodcastStatus = "draft" | "published" | "paused";

export interface PodcastSeries {
  id: string;
  label: string;
}

export interface PodcastHost {
  id: string;
  name: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  episode: number;
  season: number;
  /** Duration formatted as "mm:ss" */
  duration: string;
  series: PodcastSeries;
  host: PodcastHost;
  plays: number;
  /** ISO date string — always present (creation date). */
  createdAt: string;
  /** ISO date string — date it went live. Undefined while in draft. */
  publishedAt: string | undefined;
  status: PodcastStatus;
}
