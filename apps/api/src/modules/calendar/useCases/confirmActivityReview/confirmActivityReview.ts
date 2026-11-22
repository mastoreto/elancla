import {
  type ActivityReviewDto,
  AUDIT_ACTIONS,
  type ConfirmReviewBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { confirmReviewRow, findActivityRow } from "../../data";
import { NotReviewableError } from "../../domain";

/**
 * Confirms, for a year, that a fixed activity with annual review is still right. It is idempotent:
 * confirming twice keeps the first confirmation.
 */
export function confirmActivityReview(
  ctx: AuthenticatedContext,
  year: number,
  { activityId }: ConfirmReviewBody,
): Promise<ActivityReviewDto> {
  return withTransaction(db, async (tx) => {
    const activity = await findActivityRow(tx, ctx.organizationId, activityId);
    if (!activity) throw new NotFoundError("The activity was not found");
    if (!activity.isFixed || !activity.annualReview) {
      throw new NotReviewableError();
    }
    const row = await confirmReviewRow(tx, {
      activityId,
      year,
      userId: ctx.user.id,
    });
    const confirmed = {
      activityId,
      year,
      confirmedAt: row.confirmedAt.toISOString(),
    };
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.activityReview.confirmed,
      entity: { type: "recurringActivity", id: activityId },
      after: confirmed,
    });
    return confirmed;
  });
}
