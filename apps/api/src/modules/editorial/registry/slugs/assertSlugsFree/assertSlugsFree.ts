import type { EditorialContentType } from "@ancla/db";
import type { GoLiveContext } from "../../editorialTypes";
import { ContentSlugTakenError } from "../errors";

interface TranslatedSnapshot {
  translations: Record<string, { slug: string }>;
}

/** The slugs of every language of a translated snapshot (`{ translations: { <locale>: { slug } } }`). */
export const slugsOf = (snapshot: Record<string, unknown>): string[] =>
  Object.values((snapshot as unknown as TranslatedSnapshot).translations).map(
    (translation) => translation.slug,
  );

/**
 * The first slug of `mine` that another snapshot uses, in any language: the public site looks an
 * item up by slug without knowing its language, so a repeat would be ambiguous.
 */
export function findTakenSlug(
  mine: readonly string[],
  others: readonly Record<string, unknown>[],
): string | undefined {
  const wanted = new Set(mine);
  for (const other of others) {
    const taken = slugsOf(other).find((slug) => wanted.has(slug));
    if (taken) return taken;
  }
  return undefined;
}

/**
 * No slug of the revision going live may belong to another item of the same type that is live
 * right now (a scheduled one included: it will be the moment it shows). Paused items do not
 * count; resuming one runs this check again.
 */
export async function assertSlugsFree(
  { tx, organizationId, entityId, snapshot }: GoLiveContext,
  contentType: EditorialContentType,
): Promise<void> {
  const others = await tx.contentRevision.findMany({
    where: {
      organizationId,
      contentType,
      state: "PUBLISHED",
      entityId: { not: entityId },
    },
    select: { snapshot: true },
  });
  // ponytail: in-memory scan, index slugs if a type grows past ~1000 items.
  const taken = findTakenSlug(
    slugsOf(snapshot),
    others.map((other) => other.snapshot as Record<string, unknown>),
  );
  if (taken) throw new ContentSlugTakenError(taken);
}
