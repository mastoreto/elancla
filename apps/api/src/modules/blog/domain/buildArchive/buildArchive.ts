import type { PublicBlogArchiveEntryDto } from "@ancla/contracts";
import { urlDate } from "../urlDate";

/**
 * Year/month buckets of the posts' first publication (the month of their URL date), newest
 * first. Receives only the visible posts' `firstLiveAt`.
 */
export function buildArchive(
  firstLiveDates: readonly Date[],
  timeZone: string,
): PublicBlogArchiveEntryDto[] {
  const counts = new Map<string, PublicBlogArchiveEntryDto>();
  for (const instant of firstLiveDates) {
    const [year, month] = urlDate(instant, timeZone).split("-").map(Number);
    const key = `${year}-${month}`;
    const entry = counts.get(key) ?? {
      year: year as number,
      month: month as number,
      count: 0,
    };
    counts.set(key, { ...entry, count: entry.count + 1 });
  }
  return [...counts.values()].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );
}
