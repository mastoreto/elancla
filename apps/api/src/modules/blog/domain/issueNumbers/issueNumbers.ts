export interface IssueSource {
  id: string;
  firstLiveAt: Date;
}

/**
 * Edition number of each post: order of first publication among the given (visible) posts,
 * 1 = oldest. The id breaks ties so the numbering is stable.
 */
export function issueNumbers(
  posts: readonly IssueSource[],
): Map<string, number> {
  const ordered = [...posts].sort(
    (a, b) =>
      a.firstLiveAt.getTime() - b.firstLiveAt.getTime() ||
      a.id.localeCompare(b.id),
  );
  return new Map(ordered.map(({ id }, index) => [id, index + 1]));
}
