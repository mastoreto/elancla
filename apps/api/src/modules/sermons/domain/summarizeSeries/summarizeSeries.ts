import type { SermonSnapshot } from "@ancla/contracts";

export interface SeriesSummary {
  /** Live sermons of the series. */
  sermonCount: number;
  /** `YYYY-MM-DD` of the first and the last sermon preached. */
  firstPreachedOn: string;
  lastPreachedOn: string;
}

/**
 * Count and date range of each series, computed from the live sermons (never stored, so they
 * cannot drift). A series with no live sermon has no entry.
 */
export function summarizeSeries(
  liveSnapshots: readonly Pick<SermonSnapshot, "seriesId" | "preachedOn">[],
): Map<string, SeriesSummary> {
  const summaries = new Map<string, SeriesSummary>();
  for (const { seriesId, preachedOn } of liveSnapshots) {
    if (seriesId === undefined) continue;
    const current = summaries.get(seriesId);
    summaries.set(
      seriesId,
      current
        ? {
            sermonCount: current.sermonCount + 1,
            firstPreachedOn:
              preachedOn < current.firstPreachedOn
                ? preachedOn
                : current.firstPreachedOn,
            lastPreachedOn:
              preachedOn > current.lastPreachedOn
                ? preachedOn
                : current.lastPreachedOn,
          }
        : {
            sermonCount: 1,
            firstPreachedOn: preachedOn,
            lastPreachedOn: preachedOn,
          },
    );
  }
  return summaries;
}
