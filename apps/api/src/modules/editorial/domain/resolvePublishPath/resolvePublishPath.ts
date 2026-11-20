export type PublishPath = "direct" | "reviewOnly";

/** Whoever can publish and is not under mandatory review publishes directly; the rest go through a reviewer. */
export function resolvePublishPath(
  canPublish: boolean,
  mustReview: boolean,
): PublishPath {
  return canPublish && !mustReview ? "direct" : "reviewOnly";
}
