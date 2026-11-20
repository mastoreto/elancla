const HEADING_ID_MAX_LENGTH = 80;
const HEADING_ID_FALLBACK = "seccion";
const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_ALPHANUMERIC_RUN = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;

/**
 * Anchor id of a heading: lowercase, no accents, hyphen-separated ("Esperanza y ancla" ->
 * "esperanza-y-ancla"). The table of contents and the renderer both use it, so links always match.
 */
export function headingId(text: string): string {
  const id = text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_RUN, "-")
    .replace(EDGE_HYPHENS, "")
    .slice(0, HEADING_ID_MAX_LENGTH)
    .replace(EDGE_HYPHENS, "");
  return id === "" ? HEADING_ID_FALLBACK : id;
}

/** `headingId` of every heading of a document, in order; repeated ones get `-2`, `-3`... */
export function uniqueHeadingIds(texts: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((text) => {
    const base = headingId(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}
