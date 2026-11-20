import type { EditorialActionDto } from "@ancla/contracts";
import type { EditorialState } from "@ancla/db";
import { nextState } from "../editorialMachine";
import { resolvePublishPath } from "../resolvePublishPath";

export interface AvailableActionsInput {
  /** State of the working revision, `null` when there is none. */
  working: EditorialState | null;
  /** State of the live revision (`PUBLISHED` or `PAUSED`), `null` when there is none. */
  live: EditorialState | null;
  canEdit: boolean;
  canPublish: boolean;
  /** The acting user, or the author of the working revision, is under mandatory review. */
  mustReview: boolean;
  isReviewer: boolean;
  /** The acting user wrote the working revision. */
  isAuthor: boolean;
}

/** What the user can do right now. The CRM paints exactly this and re-implements no rule. */
export function availableActions(
  input: AvailableActionsInput,
): EditorialActionDto[] {
  const { working, live, canEdit, canPublish, mustReview } = input;
  const actions: EditorialActionDto[] = [];
  const direct = resolvePublishPath(canPublish, mustReview) === "direct";

  if (canEdit && nextState(working, "saveDraft")) actions.push("saveDraft");
  if (canEdit && nextState(working, "submit")) actions.push("submit");
  if (direct && nextState(working, "publish")) actions.push("publish");
  // Resuming needs no review: that content was approved already.
  if (canPublish && !working && nextState(live, "resume")) {
    actions.push("resume");
  }
  const canDecide =
    input.isReviewer && !input.isAuthor && nextState(working, "approve");
  if (canDecide) actions.push("approve", "requestChanges");
  if (canPublish && nextState(live, "pause")) actions.push("pause");
  return actions;
}
