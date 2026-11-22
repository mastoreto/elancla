import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import { parseDateOnly, yearOf } from "../domain";

export function findOrganizationTimezone(
  organizationId: string,
): Promise<{ timezone: string } | null> {
  return db.organization.findUnique({
    where: { id: organizationId },
    select: { timezone: true },
  });
}

/**
 * What the resolution of a date range needs: the live sets, the exceptions inside the range and
 * the calendar years published among the years the range touches.
 */
export async function findScheduleContext(
  organizationId: string,
  range: { from: string; to: string },
) {
  const tenantDb = forOrganization(db, organizationId);
  const years = [...new Set([yearOf(range.from), yearOf(range.to)])];
  const [sets, exceptions, publishedYears] = await Promise.all([
    tenantDb.scheduleSet.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    }),
    tenantDb.scheduleException.findMany({
      where: {
        date: { gte: parseDateOnly(range.from), lte: parseDateOnly(range.to) },
      },
    }),
    tenantDb.calendarYear.findMany({
      where: { status: "PUBLISHED", year: { in: years } },
      select: { year: true },
    }),
  ]);
  return {
    sets,
    exceptions,
    publishedYears: publishedYears.map(({ year }) => year),
  };
}

export type ScheduleContextRows = Awaited<
  ReturnType<typeof findScheduleContext>
>;

interface PublicActivityFilter {
  scheduleSetIds: readonly string[];
  /** Only the activities that are a service time (worship or Bible school). */
  serviceOnly?: boolean;
  /** Only the activities linked to this ministry. */
  ministryId?: string;
}

/** The public, live activities of some sets: the candidates for a week of public hours. */
export function findPublicActivities(
  organizationId: string,
  filter: PublicActivityFilter,
) {
  const where: Prisma.RecurringActivityWhereInput = {
    deletedAt: null,
    isPublic: true,
    scheduleSetId: { in: [...filter.scheduleSetIds] },
    ...(filter.serviceOnly ? { serviceKind: { not: null } } : {}),
    ...(filter.ministryId
      ? { ministries: { some: { ministryId: filter.ministryId } } }
      : {}),
  };
  return forOrganization(db, organizationId).recurringActivity.findMany({
    where,
    orderBy: [{ weekday: "asc" }, { start: "asc" }, { id: "asc" }],
  });
}

export type PublicActivityRow = Awaited<
  ReturnType<typeof findPublicActivities>
>[number];
