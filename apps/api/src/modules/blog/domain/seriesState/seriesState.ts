import type { PublicSeriesItemDto } from "@ancla/contracts";

export interface SeriesMemberFacts {
  postId: string;
  /** Visible now. A published post that is not visible is a scheduled one. */
  visible: boolean;
}

/**
 * State of a series entry as the public site shows it: the post being read is `current`, a
 * visible one `published`, a scheduled one `next` (title and date only). Drafts and paused
 * posts never reach this function: the caller only passes published revisions.
 */
export function seriesState(
  member: SeriesMemberFacts,
  currentPostId?: string,
): PublicSeriesItemDto["state"] {
  if (member.postId === currentPostId) return "current";
  return member.visible ? "published" : "next";
}
