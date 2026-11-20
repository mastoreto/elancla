import type { BlogPostSnapshot, BlogPostTranslation } from "@ancla/contracts";
import { isVisible } from "../isVisible";

/** What the editorial module hands over for a published revision. */
export interface LiveBlogRevision {
  entityId: string;
  snapshot: Record<string, unknown>;
  publishedAt: Date | null;
}

/** A published post with the facts every public calculation reads. */
export interface BlogEntry {
  postId: string;
  snapshot: BlogPostSnapshot;
  /** Fixed date of the post URL. */
  firstLiveAt: Date;
  /** `publishAt ?? firstLiveAt`: the date the site shows. */
  displayedAt: Date;
  /** False while the post is scheduled (`publishAt` in the future). */
  visible: boolean;
  /** When the live revision was published, for `modifiedAt`. */
  revisionPublishedAt: Date | null;
}

/**
 * The published revisions as entries. A post with no `firstLiveAt` never went live through the
 * go-live hook, so it has no URL date and is left out.
 */
export function buildBlogEntries(
  revisions: readonly LiveBlogRevision[],
  firstLiveByPost: ReadonlyMap<string, Date>,
  now: Date,
): BlogEntry[] {
  return revisions.flatMap((revision): BlogEntry[] => {
    const firstLiveAt = firstLiveByPost.get(revision.entityId);
    if (!firstLiveAt) return [];
    const snapshot = revision.snapshot as unknown as BlogPostSnapshot;
    return [
      {
        postId: revision.entityId,
        snapshot,
        firstLiveAt,
        displayedAt: snapshot.publishAt
          ? new Date(snapshot.publishAt)
          : firstLiveAt,
        visible: isVisible(snapshot, now),
        revisionPublishedAt: revision.publishedAt,
      },
    ];
  });
}

/** The visible entry that has `slug` in any of its languages (scheduled ones do not answer). */
export function findVisibleEntryBySlug(
  entries: readonly BlogEntry[],
  slug: string,
): BlogEntry | null {
  return (
    entries.find(
      (entry) =>
        entry.visible &&
        Object.values(entry.snapshot.translations).some(
          (translation) => translation.slug === slug,
        ),
    ) ?? null
  );
}

export interface PickedBlogTranslation {
  locale: string;
  translation: BlogPostTranslation;
}

/** The requested language, or the default one when the post lacks it; `null` if it has neither. */
export function pickBlogTranslation(
  snapshot: BlogPostSnapshot,
  { locale, defaultLocale }: { locale: string; defaultLocale: string },
): PickedBlogTranslation | null {
  for (const candidate of [locale, defaultLocale]) {
    const translation = snapshot.translations[candidate];
    if (translation) return { locale: candidate, translation };
  }
  return null;
}
