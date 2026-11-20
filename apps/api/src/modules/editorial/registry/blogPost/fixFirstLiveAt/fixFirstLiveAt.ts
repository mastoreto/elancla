import type { BlogPostSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";

interface FirstLiveInput {
  current: Date | null;
  publishAt: string | undefined;
  now: Date;
}

/**
 * The value `Post.firstLiveAt` must take, or `null` to leave it. It is the date of the URL, so it
 * is only set while it is empty or has not arrived yet (the post was never visible): then it is
 * `publishAt ?? now`. Once visible it never moves, whatever `publishAt` says later.
 */
export function nextFirstLiveAt({
  current,
  publishAt,
  now,
}: FirstLiveInput): Date | null {
  if (current !== null && current.getTime() <= now.getTime()) return null;
  return publishAt ? new Date(publishAt) : now;
}

export async function fixFirstLiveAt({
  tx,
  organizationId,
  entityId,
  snapshot,
  now,
}: GoLiveContext): Promise<void> {
  const post = await tx.post.findFirst({
    where: { id: entityId, organizationId },
    select: { firstLiveAt: true },
  });
  if (!post) return;
  const next = nextFirstLiveAt({
    current: post.firstLiveAt,
    publishAt: (snapshot as BlogPostSnapshot).publishAt,
    now,
  });
  if (next === null) return;
  await tx.post.update({
    where: { id: entityId },
    data: { firstLiveAt: next },
  });
}
