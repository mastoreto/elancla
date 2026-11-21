const FALLBACK_SLUG = "ministry";
const MAX_SLUG_LENGTH = 80;

/** Kebab-case ASCII slug of a name ("Enseñanza" -> "ensenanza"); never empty. */
export function slugifyMinistryName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
  return slug || FALLBACK_SLUG;
}
