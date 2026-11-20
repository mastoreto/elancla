import { db, type Prisma } from "@ancla/db";

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

type Client = Prisma.TransactionClient | typeof db;

/** `day` is a calendar date (`YYYY-MM-DD`); a `@db.Date` column is compared as 00:00 UTC. */
export const dayToDate = (day: string): Date => new Date(`${day}T00:00:00Z`);

/**
 * Registers the visitor of the day; true only the first time (the primary key rejects repeats
 * atomically, so two concurrent requests of one visitor cannot both count).
 */
export async function insertVisitorIfNew(
  tx: Client,
  input: { postId: string; day: string; visitorHash: string },
): Promise<boolean> {
  const inserted = await tx.$executeRaw`
    INSERT INTO post_view_visitors ("postId", "day", "visitorHash")
    VALUES (${input.postId}::uuid, ${dayToDate(input.day)}, ${input.visitorHash})
    ON CONFLICT DO NOTHING`;
  return inserted > 0;
}

export function incrementDailyViews(
  tx: Client,
  postId: string,
  day: string,
): Promise<unknown> {
  const date = dayToDate(day);
  return tx.postViewDaily.upsert({
    where: { postId_day: { postId, day: date } },
    create: { postId, day: date, count: 1 },
    update: { count: { increment: 1 } },
  });
}

/** Visitors of earlier days of one post: they can no longer repeat, so they are not needed. */
export function deleteVisitorsBefore(
  tx: Client,
  postId: string,
  day: string,
): Promise<unknown> {
  return tx.postViewVisitor.deleteMany({
    where: { postId, day: { lt: dayToDate(day) } },
  });
}

/** Visitors of the organization's posts that belong to a day before `day`. */
export async function deleteOrganizationVisitorsBefore(
  organizationId: string,
  day: string,
): Promise<number> {
  const { count } = await db.postViewVisitor.deleteMany({
    where: { post: { organizationId }, day: { lt: dayToDate(day) } },
  });
  return count;
}
