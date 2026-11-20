import type { SimplePageSnapshot } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import type { GoLiveContext } from "../editorialTypes";
import { SlugTakenError } from "./slugTakenError";

export async function simplePageExists(
  tx: Prisma.TransactionClient,
  organizationId: string,
  entityId: string,
): Promise<boolean> {
  const found = await tx.simplePage.findFirst({
    where: { id: entityId, organizationId },
    select: { id: true },
  });
  return found !== null;
}

const slugsOf = (snapshot: Record<string, unknown>): string[] =>
  Object.values((snapshot as SimplePageSnapshot).translations).map(
    (translation) => translation.slug,
  );

/**
 * No slug of the revision going live may belong to another page that is live right now. Paused
 * pages do not count (they are hidden); resuming one runs this check again.
 */
export async function assertSimplePageSlugsFree({
  tx,
  organizationId,
  entityId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const mine = new Set(slugsOf(snapshot));
  const others = await tx.contentRevision.findMany({
    where: {
      organizationId,
      contentType: "SIMPLE_PAGE",
      state: "PUBLISHED",
      entityId: { not: entityId },
    },
    select: { snapshot: true },
  });
  // ponytail: in-memory scan, index slugs if pages grow past ~100.
  for (const other of others) {
    const taken = slugsOf(other.snapshot as Record<string, unknown>).find(
      (slug) => mine.has(slug),
    );
    if (taken) throw new SlugTakenError(taken);
  }
}
