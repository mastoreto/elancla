import { AUDIT_ACTIONS, type EditorialStatusDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { withTransaction } from "../../../../core/db";
import type { Mailer } from "../../../../core/mail";
import { InvalidTransitionError, nextState } from "../../domain";
import { notifyEditorial } from "../../notifications";
import {
  auditTransition,
  buildEditorialStatus,
  type EditorialInput,
  failOnRace,
  loadEditorialState,
  moveRevision,
} from "../editorialState";

interface SubmitInput extends EditorialInput {
  mailer: Mailer;
}

/** Sends the draft to the reviewers of the type. */
export async function submit(input: SubmitInput): Promise<EditorialStatusDto> {
  const { ctx, definition, mailer } = input;
  const { status, submitted } = await failOnRace(() =>
    withTransaction(db, async (tx) => {
      const { working } = await loadEditorialState(tx, input);
      if (!working || nextState(working.state, "submit") !== "IN_REVIEW") {
        throw new InvalidTransitionError();
      }
      const moved = await moveRevision(tx, {
        organizationId: ctx.organizationId,
        revision: working,
        from: "DRAFT",
        data: {
          state: "IN_REVIEW",
          submittedAt: new Date(),
          // A new round: nothing of the previous decision applies to it.
          comment: null,
          reviewerId: null,
          decidedAt: null,
        },
      });
      await auditTransition(tx, input, {
        action: AUDIT_ACTIONS.editorial.submitted,
        before: working,
        after: moved,
      });
      return {
        status: await buildEditorialStatus(tx, input),
        submitted: moved,
      };
    }),
  );
  await notifyEditorial({
    mailer,
    organizationId: ctx.organizationId,
    definition,
    variant: "submitted",
    revision: submitted,
    actor: ctx.user,
  });
  return status;
}
