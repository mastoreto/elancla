import type { Podcast } from "../types";

export const PODCASTS_PAGE_SIZE = 4;

export function getTotalPlays(podcasts: Podcast[]): number {
  return podcasts.reduce((total, podcast) => total + podcast.plays, 0);
}

/** "42:00" → 42; blank or malformed durations count as 0. */
export function getDurationMinutes(duration: string): number {
  const minutes = Number.parseInt(duration.split(":")[0] ?? "", 10);
  return Number.isNaN(minutes) ? 0 : minutes;
}

/** Average length of the published episodes, rounded to whole minutes. */
export function getAverageMinutes(podcasts: Podcast[]): number {
  const published = podcasts.filter((podcast) => podcast.status === "published");
  if (published.length === 0) return 0;
  const total = published.reduce((sum, podcast) => sum + getDurationMinutes(podcast.duration), 0);
  return Math.round(total / published.length);
}

export function getSeriesNames(podcasts: Podcast[]): string[] {
  return [...new Set(podcasts.map((podcast) => podcast.series.label))];
}
