import type { EditorialInboxDto } from "@ancla/contracts";
import { db, type EditorialContentType } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../core/context";
import {
  findChangesRequestedRows,
  findReviewSettings,
  findToReviewRows,
} from "../../data";
import { isReviewer } from "../../domain";
import { toInboxItemDto } from "../../mappers";
import { EDITORIAL_CONTENT_TYPE_LIST } from "../../registry";

/**
 * Pending work, derived from the revisions themselves (there is no notification table): what is
 * waiting for the user's review and what came back to them with changes requested.
 */
export async function getInbox(
  ctx: AuthenticatedContext,
): Promise<EditorialInboxDto> {
  const person = {
    userId: ctx.user.id,
    roleIds: ctx.access.roles.map((role) => role.id),
    isAdmin: ctx.access.isAdmin,
  };
  const reviewedTypes: EditorialContentType[] = [];
  for (const definition of EDITORIAL_CONTENT_TYPE_LIST) {
    const settings = await findReviewSettings(
      db,
      ctx.organizationId,
      definition.contentType,
    );
    if (isReviewer(settings, person))
      reviewedTypes.push(definition.contentType);
  }
  const [toReview, changesRequested] = await Promise.all([
    findToReviewRows(ctx.organizationId, reviewedTypes, ctx.user.id),
    findChangesRequestedRows(ctx.organizationId, ctx.user.id),
  ]);
  return {
    toReview: toReview.map((row) => toInboxItemDto(row, row.submittedAt)),
    changesRequested: changesRequested.map((row) =>
      toInboxItemDto(row, row.decidedAt),
    ),
  };
}
