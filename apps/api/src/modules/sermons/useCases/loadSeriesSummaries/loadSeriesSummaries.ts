import type { SermonSnapshot } from "@ancla/contracts";
import { listLiveSnapshots } from "../../../editorial";
import { type SeriesSummary, summarizeSeries } from "../../domain";

/** Count and date range of each series over the live (published) sermons of the organization. */
export async function loadSeriesSummaries(
  organizationId: string,
): Promise<Map<string, SeriesSummary>> {
  const live = await listLiveSnapshots(organizationId, "SERMON");
  // ponytail: in-memory scan, same as the public reads.
  return summarizeSeries(
    live.map(({ snapshot }) => snapshot as unknown as SermonSnapshot),
  );
}
