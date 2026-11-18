import type { Sermon, SermonStatusFilter } from "../types";

export const SERMONS_PAGE_SIZE = 4;

export function filterSermons(
  sermons: Sermon[],
  searchQuery: string,
  status: SermonStatusFilter,
): Sermon[] {
  const query = searchQuery.trim().toLowerCase();

  return sermons.filter((sermon) => {
    if (status !== "all" && sermon.status !== status) return false;
    if (!query) return true;
    return [sermon.title, sermon.preacher, sermon.passage, sermon.series]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function countByStatus(sermons: Sermon[]): Record<SermonStatusFilter, number> {
  return {
    all: sermons.length,
    published: sermons.filter((sermon) => sermon.status === "published").length,
    draft: sermons.filter((sermon) => sermon.status === "draft").length,
  };
}

export function getTotalPlays(sermons: Sermon[]): number {
  return sermons.reduce((total, sermon) => total + (sermon.plays ?? 0), 0);
}

export function isValidYoutubeUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"].includes(hostname);
  } catch {
    return false;
  }
}
