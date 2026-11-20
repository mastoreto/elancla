import type { BlogPostSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { BlogSlugTakenError } from "../errors";

export const blogSlugsOf = (snapshot: Record<string, unknown>): string[] =>
  Object.values((snapshot as BlogPostSnapshot).translations).map(
    (translation) => translation.slug,
  );

/**
 * The first slug of `mine` that another snapshot uses, in any language: the public site looks a
 * post up by slug without knowing its language, so a repeat would be ambiguous.
 */
export function findTakenSlug(
  mine: readonly string[],
  others: readonly Record<string, unknown>[],
): string | undefined {
  const wanted = new Set(mine);
  for (const other of others) {
    const taken = blogSlugsOf(other).find((slug) => wanted.has(slug));
    if (taken) return taken;
  }
  return undefined;
}

/**
 * No slug of the revision going live may belong to another post that is live right now (a
 * scheduled one included: it will be the moment it shows). Paused posts do not count; resuming
 * one runs this check again.
 */
export async function assertBlogSlugsFree({
  tx,
  organizationId,
  entityId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const others = await tx.contentRevision.findMany({
    where: {
      organizationId,
      contentType: "BLOG_POST",
      state: "PUBLISHED",
      entityId: { not: entityId },
    },
    select: { snapshot: true },
  });
  // ponytail: in-memory scan, index slugs if posts grow past ~1000.
  const taken = findTakenSlug(
    blogSlugsOf(snapshot),
    others.map((other) => other.snapshot as Record<string, unknown>),
  );
  if (taken) throw new BlogSlugTakenError(taken);
}
