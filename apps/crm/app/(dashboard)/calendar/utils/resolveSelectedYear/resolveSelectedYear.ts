interface ResolveSelectedYearInput {
  /** The raw `?year=` of the URL. */
  requested: string | undefined;
  /** The years that already exist, in any order. */
  years: readonly number[];
  /** The church's current year. */
  currentYear: number;
}

/**
 * The year the list shows: the requested one when it exists, else the current year, else the most
 * recent one. `null` when no year has been created yet.
 */
export function resolveSelectedYear({
  requested,
  years,
  currentYear,
}: ResolveSelectedYearInput): number | null {
  if (years.length === 0) return null;
  const requestedYear = Number(requested);
  if (Number.isInteger(requestedYear) && years.includes(requestedYear)) return requestedYear;
  if (years.includes(currentYear)) return currentYear;
  return Math.max(...years);
}
