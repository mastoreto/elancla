import type { EditorialStatusDto } from "@ancla/contracts";

/**
 * While the year is a draft its events can only be saved as drafts: they go live together when the
 * year is published, and publishing one on its own is a 409 `year_not_published`. The API does not
 * trim the actions for that, so the editor does, without touching what the API said otherwise.
 */
export function limitActionsToDraft(
  status: EditorialStatusDto,
  yearIsDraft: boolean,
): EditorialStatusDto {
  if (!yearIsDraft) return status;
  return {
    ...status,
    availableActions: status.availableActions.filter((action) => action === "saveDraft"),
  };
}
