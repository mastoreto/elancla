import { AUDIT_ACTIONS, type EditorialStatusDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { withTransaction } from "../../../../core/db";
import {
  InvalidTransitionError,
  nextState,
  ReviewRequiredError,
  resolvePublishPath,
} from "../../domain";
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

/**
 * Publishes the draft directly, or, when there is none and the live revision is paused, resumes
 * it. The route already checked `publish`; mandatory review is the rule left to enforce here.
 */
export function publish(input: EditorialInput): Promise<EditorialStatusDto> {
  const { ctx } = input;
  return failOnRace(() =>
    withTransaction(db, async (tx) => {
      const { working, live, mustReview } = await loadEditorialState(tx, input);
      const now = new Date();

      if (!working) {
        // Resuming something approved before: no review needed.
        if (!live || nextState(live.state, "resume") !== "PUBLISHED") {
          throw new InvalidTransitionError();
        }
        // Another page may have taken the slug while this one was paused.
        await beforeGoLive(tx, input, live);
        const resumed = await moveRevision(tx, {
          organizationId: ctx.organizationId,
          revision: live,
          from: "PAUSED",
          data: { state: "PUBLISHED" },
        });
        await auditTransition(tx, input, {
          action: AUDIT_ACTIONS.editorial.resumed,
          before: live,
          after: resumed,
        });
        return buildEditorialStatus(tx, input);
      }

      if (resolvePublishPath(true, mustReview) !== "direct")
        throw new ReviewRequiredError();
      if (nextState(working.state, "publish") !== "PUBLISHED")
        throw new InvalidTransitionError();
      await beforeGoLive(tx, input, working);
      await retireLive(tx, ctx.organizationId, live);
      const published = await moveRevision(tx, {
        organizationId: ctx.organizationId,
        revision: working,
        from: "DRAFT",
        data: { state: "PUBLISHED", publishedAt: now },
      });
      await auditTransition(tx, input, {
        action: AUDIT_ACTIONS.editorial.published,
        before: working,
        after: published,
        metadata: live ? { supersededRevisionId: live.id } : undefined,
      });
      return buildEditorialStatus(tx, input);
    }),
  );
}
