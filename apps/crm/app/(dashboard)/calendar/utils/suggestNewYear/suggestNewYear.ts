/** The year "Crear año" starts with: the one after the latest, or the current year when there is none. */
export function suggestNewYear(years: readonly number[], currentYear: number): number {
  return years.length === 0 ? currentYear : Math.max(...years) + 1;
}
