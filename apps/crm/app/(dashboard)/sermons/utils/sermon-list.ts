import type { Sermon } from "../types";

export const SERMONS_PAGE_SIZE = 4;

export function getTotalPlays(sermons: Sermon[]): number {
  return sermons.reduce((total, sermon) => total + (sermon.plays ?? 0), 0);
}

/** Distinct series across the library, in first-seen order. */
export function getSeriesNames(sermons: Sermon[]): string[] {
  return [...new Set(sermons.map((sermon) => sermon.series))];
}

/** Series with two or more sermons read as "Serie: …"; one-offs show just the name. */
export function describeSeries(sermon: Sermon, sermons: Sermon[]): string {
  const count = sermons.filter((item) => item.series === sermon.series).length;
  return count > 1 ? `Serie: ${sermon.series}` : sermon.series;
}

export function isValidYoutubeUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"].includes(hostname);
  } catch {
    return false;
  }
}
