/**
 * The ids after clicking `id`: it leaves when it was in, and enters (at the end) when there is room.
 * With no `max` there is no limit.
 */
export function toggleSelection(
  ids: readonly string[],
  id: string,
  max = Number.POSITIVE_INFINITY,
): string[] {
  if (ids.includes(id)) return ids.filter((current) => current !== id);
  return ids.length >= max ? [...ids] : [...ids, id];
}
