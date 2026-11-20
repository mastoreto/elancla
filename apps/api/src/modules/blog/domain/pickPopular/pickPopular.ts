export const POPULAR_POSTS_COUNT = 5;

interface PopularCandidate {
  postId: string;
  displayedAt: Date;
}

/**
 * Ids of the most read posts: the ones with views in the window, by views and, on a tie, the most
 * recent first. A post nobody read is not "popular", so it never fills the list.
 */
export function pickPopular(
  visible: readonly PopularCandidate[],
  recentViews: ReadonlyMap<string, number>,
  limit: number = POPULAR_POSTS_COUNT,
): string[] {
  return visible
    .filter(({ postId }) => (recentViews.get(postId) ?? 0) > 0)
    .sort(
      (a, b) =>
        (recentViews.get(b.postId) ?? 0) - (recentViews.get(a.postId) ?? 0) ||
        b.displayedAt.getTime() - a.displayedAt.getTime() ||
        a.postId.localeCompare(b.postId),
    )
    .slice(0, limit)
    .map(({ postId }) => postId);
}
