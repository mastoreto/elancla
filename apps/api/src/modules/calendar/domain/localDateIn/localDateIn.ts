/**
 * Today's date in the church's time zone as "YYYY-MM-DD". `Intl` only, no dependencies: at
 * 23:30 in Montevideo it is already tomorrow in UTC, and the calendar must follow the church.
 */
export function localDateIn(timezone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
