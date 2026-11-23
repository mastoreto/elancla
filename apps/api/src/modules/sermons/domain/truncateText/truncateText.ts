const HIGH_SURROGATE_START = 0xd800;
const HIGH_SURROGATE_END = 0xdbff;

/**
 * The text cut to `max` UTF-16 units (what the contracts count), trimmed. A cut never leaves half
 * of an emoji: a lone surrogate is not valid JSON for the database.
 */
export function truncateText(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const last = cut.charCodeAt(cut.length - 1);
  const safe =
    last >= HIGH_SURROGATE_START && last <= HIGH_SURROGATE_END
      ? cut.slice(0, -1)
      : cut;
  return safe.trim();
}
