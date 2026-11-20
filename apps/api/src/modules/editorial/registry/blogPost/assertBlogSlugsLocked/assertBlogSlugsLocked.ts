import type { BlogPostSnapshot } from "@ancla/contracts";
import type { GoLiveContext } from "../../editorialTypes";
import { BlogSlugLockedError } from "../errors";

const slugsByLocale = (
  snapshot: Record<string, unknown>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries((snapshot as BlogPostSnapshot).translations).map(
      ([locale, translation]) => [locale, translation.slug],
    ),
  );

/**
 * The first language the previous (published or paused) revision had with a slug the next one
 * changes. A language the previous revision lacked is new and free to pick; one the next
 * revision drops has nothing to compare.
 */
export function findLockedLocale(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
): string | undefined {
  const before = slugsByLocale(previous);
  const after = slugsByLocale(next);
  return Object.keys(before).find(
    (locale) => after[locale] !== undefined && after[locale] !== before[locale],
  );
}

/** Once a post was live its URLs are public: the slug of each published language stays. */
export async function assertBlogSlugsLocked({
  tx,
  organizationId,
  entityId,
  snapshot,
}: GoLiveContext): Promise<void> {
  const previous = await tx.contentRevision.findFirst({
    where: {
      organizationId,
      contentType: "BLOG_POST",
      entityId,
      state: { in: ["PUBLISHED", "PAUSED"] },
    },
    select: { snapshot: true },
  });
  if (!previous) return;
  const locked = findLockedLocale(
    previous.snapshot as Record<string, unknown>,
    snapshot,
  );
  if (locked) throw new BlogSlugLockedError(locked);
}
