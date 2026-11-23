import type { GoLiveContext } from "../../editorialTypes";

/**
 * The value `Sermon.firstLiveAt` must take, or `null` to leave it: the first time the sermon goes
 * live it is `now`, and from then on it never moves (the seed may have set it earlier).
 */
export function nextSermonFirstLiveAt(
  current: Date | null,
  now: Date,
): Date | null {
  return current === null ? now : null;
}

export async function fixSermonFirstLiveAt({
  tx,
  organizationId,
  entityId,
  now,
}: GoLiveContext): Promise<void> {
  const sermon = await tx.sermon.findFirst({
    where: { id: entityId, organizationId },
    select: { firstLiveAt: true },
  });
  if (!sermon) return;
  const next = nextSermonFirstLiveAt(sermon.firstLiveAt, now);
  if (next === null) return;
  await tx.sermon.update({
    where: { id: entityId },
    data: { firstLiveAt: next },
  });
}
