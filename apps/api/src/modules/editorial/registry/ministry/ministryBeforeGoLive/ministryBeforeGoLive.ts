import type { MinistrySnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { assertMediaValid } from "../../media";
import { assertSlugsFree, assertSlugsLocked } from "../../slugs";

/** Cover and social image of the profile, when it has them. */
export function ministryMediaIds(snapshot: Record<string, unknown>): string[] {
  const { coverMediaId, socialImageId } = snapshot as MinistrySnapshot;
  return [coverMediaId, socialImageId].filter(
    (id): id is string => id !== undefined,
  );
}

/**
 * What a ministry profile must satisfy to go live (publish, approve, resume), in the transaction
 * of the transition: images of the organization and public URLs that are free and do not change.
 */
export async function ministryBeforeGoLive(
  context: GoLiveContext,
): Promise<void> {
  await assertMediaValid(
    context,
    ministryMediaIds(context.snapshot),
    "The cover and the social image must be finished content images of the organization",
  );
  await assertSlugsFree(context, "MINISTRY");
  await assertSlugsLocked(context, "MINISTRY");
}
