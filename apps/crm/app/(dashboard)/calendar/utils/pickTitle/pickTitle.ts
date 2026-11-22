const UNTITLED = "Sin título";

/** The title in the default language, else the first one the item has, else "Sin título". */
export function pickTitle(titles: Record<string, string>, defaultLocale: string): string {
  const preferred = titles[defaultLocale];
  if (preferred) return preferred;
  return Object.values(titles).find((title) => title !== "") ?? UNTITLED;
}
