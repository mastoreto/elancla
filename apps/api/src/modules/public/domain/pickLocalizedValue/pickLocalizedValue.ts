export interface ServedLocales {
  locale: string;
  defaultLocale: string;
}

/**
 * The value in the requested language, or in the default one when the requested has none (a row
 * missing, or `read` giving `null`). `null` when neither has it.
 */
export function pickLocalizedValue<Row extends { locale: string }, Value>(
  rows: readonly Row[],
  { locale, defaultLocale }: ServedLocales,
  read: (row: Row) => Value | null,
): Value | null {
  for (const candidate of [locale, defaultLocale]) {
    const row = rows.find((entry) => entry.locale === candidate);
    const value = row ? read(row) : null;
    if (value !== null) return value;
  }
  return null;
}
