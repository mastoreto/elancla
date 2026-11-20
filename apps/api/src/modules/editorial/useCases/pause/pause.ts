import { AUDIT_ACTIONS, type EditorialStatusDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { withTransaction } from "../../../../core/db";
import { InvalidTransitionError, nextState } from "../../domain";
import {
  auditTransition,
  buildEditorialStatus,
  type EditorialInput,
  failOnRace,
  loadEditorialState,
  moveRevision,
} from "../editorialState";

/** Hides the published version from the public site without losing it. */
export function pause(input: EditorialInput): Promise<EditorialStatusDto> {
  return failOnRace(() =>
    withTransaction(db, async (tx) => {
      const { live } = await loadEditorialState(tx, input);
      if (!live || nextState(live.state, "pause") !== "PAUSED") {
        throw new InvalidTransitionError();
      }
      const paused = await moveRevision(tx, {
        organizationId: input.ctx.organizationId,
        revision: live,
        from: "PUBLISHED",
        data: { state: "PAUSED" },
      });
      await auditTransition(tx, input, {
        action: AUDIT_ACTIONS.editorial.paused,
        before: live,
        after: paused,
      });
      return buildEditorialStatus(tx, input);
    }),
  );
}
