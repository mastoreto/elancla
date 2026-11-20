import { AUDIT_ACTIONS, type EditorialStatusDto } from "@ancla/contracts";
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
  beforeGoLive,
  buildEditorialStatus,
  type EditorialInput,
  failOnRace,
  loadEditorialState,
  moveRevision,
  retireLive,
} from "../editorialState";

interface ApproveInput extends EditorialInput {
  mailer: Mailer;
}

/** A configured reviewer (or the admin) publishes what is in review; never their own revision. */
export async function approve(
  input: ApproveInput,
): Promise<EditorialStatusDto> {
  const { ctx, definition, mailer } = input;
  const { status, approved } = await failOnRace(() =>
    withTransaction(db, async (tx) => {
      const { working, live, isReviewer } = await loadEditorialState(tx, input);
      if (!isReviewer) throw new NotReviewerError();
      if (!working || nextState(working.state, "approve") !== "PUBLISHED") {
        throw new InvalidTransitionError();
      }
      if (working.authorId === ctx.user.id) throw new SelfReviewError();

      await beforeGoLive(tx, input, working);
      await retireLive(tx, ctx.organizationId, live);
      const now = new Date();
      const moved = await moveRevision(tx, {
        organizationId: ctx.organizationId,
        revision: working,
        from: "IN_REVIEW",
        data: {
          state: "PUBLISHED",
          reviewerId: ctx.user.id,
          decidedAt: now,
          publishedAt: now,
        },
      });
      await auditTransition(tx, input, {
        action: AUDIT_ACTIONS.editorial.approved,
        before: working,
        after: moved,
        metadata: live ? { supersededRevisionId: live.id } : undefined,
      });
      return { status: await buildEditorialStatus(tx, input), approved: moved };
    }),
  );
  await notifyEditorial({
    mailer,
    organizationId: ctx.organizationId,
    definition,
    variant: "approved",
    revision: approved,
    actor: ctx.user,
  });
  return status;
}
