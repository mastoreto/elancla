const DIACRITICS = /[̀-ͯ]/g;
const NON_ALPHANUMERIC_RUN = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;

/** "¿Quiénes somos?" becomes "quienes-somos": lower case, no accents, hyphen-separated. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_RUN, "-")
    .replace(EDGE_HYPHENS, "");
}
