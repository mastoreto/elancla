/** "2026-03-05" as "05/03/2026"; the text is kept as it came when it is not a date. */
export function formatCalendarDate(date: string): string {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

/** The validity window of a schedule set in words. */
export function describeValidity(validFrom: string | null, validTo: string | null): string {
  if (validFrom && validTo) {
    return `Del ${formatCalendarDate(validFrom)} al ${formatCalendarDate(validTo)}`;
  }
  if (validFrom) return `Desde el ${formatCalendarDate(validFrom)}`;
  if (validTo) return `Hasta el ${formatCalendarDate(validTo)}`;
  return "Sin vigencia";
}
