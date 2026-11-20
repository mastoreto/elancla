import { BLOG_POST_RELATED_MAX_COUNT } from "@ancla/contracts";

export interface RelatedCandidate {
  id: string;
  seriesId: string | null;
  categoryId: string;
  /** Tags in the language being served. */
  tags: readonly string[];
  displayedAt: Date;
}

interface PickRelatedInput {
  current: RelatedCandidate & { relatedPostIds: readonly string[] };
  /** Visible posts only (the current one may be included: it is skipped). */
  candidates: readonly RelatedCandidate[];
  limit?: number;
}

const sharedTags = (a: readonly string[], b: readonly string[]): number => {
  const mine = new Set(a.map((tag) => tag.toLowerCase()));
  return b.filter((tag) => mine.has(tag.toLowerCase())).length;
};

/**
 * Ids of the related posts: the manual ones first (the ones that are visible, in the author's
 * order), completed up to `limit` by same series, same category, more shared tags, most recent.
 */
export function pickRelated({
  current,
  candidates,
  limit = BLOG_POST_RELATED_MAX_COUNT,
}: PickRelatedInput): string[] {
  const others = candidates.filter(({ id }) => id !== current.id);
  const byId = new Map(others.map((candidate) => [candidate.id, candidate]));
  const manual = current.relatedPostIds
    .filter((id) => byId.has(id))
    .slice(0, limit);

  const rank = (candidate: RelatedCandidate): number[] => [
    current.seriesId !== null && candidate.seriesId === current.seriesId
      ? 1
      : 0,
    candidate.categoryId === current.categoryId ? 1 : 0,
    sharedTags(current.tags, candidate.tags),
    candidate.displayedAt.getTime(),
  ];
  const completion = others
    .filter(({ id }) => !manual.includes(id))
    .sort((a, b) => {
      const [ra, rb] = [rank(a), rank(b)];
      const differing = ra.findIndex((value, index) => value !== rb[index]);
      return differing === -1
        ? a.id.localeCompare(b.id)
        : (rb[differing] as number) - (ra[differing] as number);
    })
    .map(({ id }) => id);

  return [...manual, ...completion].slice(0, limit);
}
