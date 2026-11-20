import {
  AUDIT_ACTIONS,
  type EditorialStatusDto,
  type RequestChangesBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { withTransaction } from "../../../../core/db";
import type { Mailer } from "../../../../core/mail";
import {
  InvalidTransitionError,
  NotReviewerError,
  nextState,
  SelfReviewError,
} from "../../domain";
import { notifyEditorial } from "../../notifications";
import {
  auditTransition,
  buildEditorialStatus,
  type EditorialInput,
  failOnRace,
  loadEditorialState,
  moveRevision,
} from "../editorialState";

interface RequestChangesInput extends EditorialInput {
  body: RequestChangesBody;
  mailer: Mailer;
}

/** The reviewer sends the revision back to its author with a comment. */
export async function requestChanges(
  input: RequestChangesInput,
): Promise<EditorialStatusDto> {
  const { ctx, definition, mailer, body } = input;
  const { status, returned } = await failOnRace(() =>
    withTransaction(db, async (tx) => {
      const { working, isReviewer } = await loadEditorialState(tx, input);
      if (!isReviewer) throw new NotReviewerError();
      if (
        !working ||
        nextState(working.state, "requestChanges") !== "CHANGES_REQUESTED"
      ) {
        throw new InvalidTransitionError();
      }
      if (working.authorId === ctx.user.id) throw new SelfReviewError();

      const moved = await moveRevision(tx, {
        organizationId: ctx.organizationId,
        revision: working,
        from: "IN_REVIEW",
        data: {
          state: "CHANGES_REQUESTED",
          comment: body.comment,
          reviewerId: ctx.user.id,
          decidedAt: new Date(),
        },
      });
      await auditTransition(tx, input, {
        action: AUDIT_ACTIONS.editorial.changesRequested,
        before: working,
        after: moved,
        metadata: { comment: body.comment },
      });
      return { status: await buildEditorialStatus(tx, input), returned: moved };
    }),
  );
  await notifyEditorial({
    mailer,
    organizationId: ctx.organizationId,
    definition,
    variant: "changesRequested",
    revision: returned,
    actor: ctx.user,
  });
  return status;
}
