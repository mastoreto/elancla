import type { Prisma } from "@ancla/db";

export type ActivityYearReviewRow = Prisma.ActivityYearReviewGetPayload<object>;

/** Confirming twice leaves the first confirmation: it is the same answer. */
export function confirmReviewRow(
  tx: Prisma.TransactionClient,
  input: { activityId: string; year: number; userId: string },
): Promise<ActivityYearReviewRow> {
  return tx.activityYearReview.upsert({
    where: {
      activityId_year: { activityId: input.activityId, year: input.year },
    },
    create: {
      activityId: input.activityId,
      year: input.year,
      confirmedById: input.userId,
    },
    update: {},
  });
}
