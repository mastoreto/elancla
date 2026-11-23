const MAX_SLUG_LENGTH = 80;
const FALLBACK_SLUG = "sermon";

/** Kebab-case ASCII slug of a title ("La fe que permanece" -> "la-fe-que-permanece"); never empty. */
export function slugifyTitle(title: string, fallback = FALLBACK_SLUG): string {
  const slug = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
  return slug || fallback;
}

/**
 * `base`, or `base-2`, `base-3`... the first one `taken` does not hold, always within the slug
 * length limit.
 */
export function pickFreeSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  for (let attempt = 2; ; attempt += 1) {
    const suffix = `-${attempt}`;
    const candidate = `${base.slice(0, MAX_SLUG_LENGTH - suffix.length).replace(/-+$/g, "")}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
