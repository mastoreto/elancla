/** The text in the default language, else the first one the entity has, else `fallback`. */
export function pickLocalized<Value extends { name: string }>(
  translations: Record<string, Value>,
  defaultLocale: string,
  fallback = "Sin nombre",
): string {
  return translations[defaultLocale]?.name ?? Object.values(translations)[0]?.name ?? fallback;
}
