import type { EditorialInboxDto } from "@ancla/contracts";
import { db, type EditorialContentType } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../core/context";
import {
  findChangesRequestedRows,
  findReviewSettings,
  findToReviewRows,
  type RevisionRow,
} from "../../data";
import { isReviewer } from "../../domain";
import { toInboxItemDto } from "../../mappers";
import { EDITORIAL_CONTENT_TYPE_LIST } from "../../registry";

/**
 * The revisions whose entity the user may see: a type that restricts who sees its entities
 * (internal events) is asked once for all of its rows, never once per row.
 */
async function visibleRevisionIds(
  ctx: AuthenticatedContext,
  rows: readonly RevisionRow[],
): Promise<Set<string>> {
  const visible = new Set(rows.map((row) => row.id));
  for (const definition of EDITORIAL_CONTENT_TYPE_LIST) {
    if (!definition.entitiesVisibleTo) continue;
    const ofType = rows.filter(
      (row) => row.contentType === definition.contentType,
    );
    if (ofType.length === 0) continue;
    const allowed = await definition.entitiesVisibleTo(
      db,
      ctx.organizationId,
      ofType.map((row) => row.entityId),
      ctx.access,
    );
    for (const row of ofType) {
      if (!allowed.has(row.entityId)) visible.delete(row.id);
    }
  }
  return visible;
}

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
  const visible = await visibleRevisionIds(ctx, [
    ...toReview,
    ...changesRequested,
  ]);
  return {
    toReview: toReview
      .filter((row) => visible.has(row.id))
      .map((row) => toInboxItemDto(row, row.submittedAt)),
    changesRequested: changesRequested
      .filter((row) => visible.has(row.id))
      .map((row) => toInboxItemDto(row, row.decidedAt)),
  };
}
