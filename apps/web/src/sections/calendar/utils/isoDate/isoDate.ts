const MS_PER_DAY = 86_400_000;

/** `YYYY-MM-DD` plus `days` calendar days (no time zone involved). */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** `YYYY-MM-DD` -> `YYYYMMDD`, the form iCalendar and Google Calendar use. */
export function compactDate(date: string): string {
  return date.replaceAll('-', '');
}

/** `HH:mm` -> `HHmm00`. */
export function compactTime(time: string): string {
  return `${time.replace(':', '')}00`;
}
