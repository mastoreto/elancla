import type { Prisma } from "@ancla/db";
import type { RecurringActivityRow } from "./activitiesRepository";

const activityInclude = {
  translations: true,
  ministries: { select: { ministryId: true } },
} satisfies Prisma.RecurringActivityInclude;

/** The activities of a year (never the fixed ones): what the copy wizard may offer. */
export function findYearActivities(
  tx: Prisma.TransactionClient,
  organizationId: string,
  year: number,
): Promise<RecurringActivityRow[]> {
  return tx.recurringActivity.findMany({
    where: { organizationId, deletedAt: null, isFixed: false, year },
    include: activityInclude,
  });
}

/** Copies an activity into another year: same slot, marked for review, never fixed. */
export async function copyActivityToYear(
  tx: Prisma.TransactionClient,
  source: RecurringActivityRow,
  year: number,
): Promise<void> {
  await tx.recurringActivity.create({
    data: {
      organizationId: source.organizationId,
      scheduleSetId: source.scheduleSetId,
      weekday: source.weekday,
      start: source.start,
      end: source.end,
      placeId: source.placeId,
      serviceKind: source.serviceKind,
      isPublic: source.isPublic,
      isFixed: false,
      year,
      annualReview: false,
      needsReview: true,
      translations: {
        create: source.translations.map(({ locale, title }) => ({
          locale,
          title,
        })),
      },
      ministries: {
        create: source.ministries.map(({ ministryId }) => ({ ministryId })),
      },
    },
  });
}
