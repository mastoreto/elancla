import { db } from "@ancla/db";

export interface PostViewTotals {
  views30d: number;
  viewsTotal: number;
}

/**
 * Daily counters of the organization's posts, summed per post: all time and since `since` (a
 * `Date` at 00:00 UTC of the first day to count; `day` is a calendar date, so no zone applies).
 * Posts without views are absent from the map.
 */
export async function sumPostViews(
  organizationId: string,
  since: Date,
): Promise<Map<string, PostViewTotals>> {
  const [total, recent] = await Promise.all([
    db.postViewDaily.groupBy({
      by: ["postId"],
      where: { post: { organizationId } },
      _sum: { count: true },
    }),
    db.postViewDaily.groupBy({
      by: ["postId"],
      where: { post: { organizationId }, day: { gte: since } },
      _sum: { count: true },
    }),
  ]);
  const recentByPost = new Map(
    recent.map((row) => [row.postId, row._sum.count ?? 0]),
  );
  return new Map(
    total.map((row) => [
      row.postId,
      {
        viewsTotal: row._sum.count ?? 0,
        views30d: recentByPost.get(row.postId) ?? 0,
      },
    ]),
  );
}
