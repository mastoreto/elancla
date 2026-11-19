/** The requested language when the organization serves it, the default one otherwise. */
export function resolvePublicLocale(
  requested: string | undefined,
  enabledLocales: readonly string[],
  defaultLocale: string,
): string {
  if (requested && enabledLocales.includes(requested)) return requested;
  return defaultLocale;
}
