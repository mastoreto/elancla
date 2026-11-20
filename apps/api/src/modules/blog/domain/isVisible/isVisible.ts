/** A published post is visible unless its `publishAt` has not arrived yet (it is scheduled). */
export function isVisible(
  snapshot: { publishAt?: string | undefined },
  now: Date,
): boolean {
  if (!snapshot.publishAt) return true;
  return new Date(snapshot.publishAt).getTime() <= now.getTime();
}
