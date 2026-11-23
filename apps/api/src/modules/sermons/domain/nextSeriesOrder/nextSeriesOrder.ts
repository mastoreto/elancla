import { SERMON_SERIES_ORDER_MAX, type SermonSnapshot } from "@ancla/contracts";

/**
 * The position a new sermon takes in a series: one after the highest one in use (1 for an empty
 * series), capped at the contract maximum.
 */
export function nextSeriesOrder(
  snapshots: readonly Pick<SermonSnapshot, "seriesId" | "seriesOrder">[],
  seriesId: string,
): number {
  const highest = snapshots
    .filter((snapshot) => snapshot.seriesId === seriesId)
    .reduce((max, snapshot) => Math.max(max, snapshot.seriesOrder ?? 0), 0);
  return Math.min(highest + 1, SERMON_SERIES_ORDER_MAX);
}
