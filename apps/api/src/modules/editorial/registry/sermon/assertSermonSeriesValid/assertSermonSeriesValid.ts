import type { SermonSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { InvalidSermonReferenceError } from "../errors";

/** The series, when there is one, belongs to the organization and is not deleted (400 `invalid_series`). */
export async function assertSermonSeriesValid({
  tx,
  organizationId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const { seriesId } = snapshot as unknown as SermonSnapshot;
  if (seriesId === undefined) return;
  const series = await tx.sermonSeries.findFirst({
    where: { id: seriesId, organizationId, deletedAt: null },
    select: { id: true },
  });
  if (!series) {
    throw new InvalidSermonReferenceError(
      "invalid_series",
      "The series does not exist",
    );
  }
}
