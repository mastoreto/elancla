/** Today's date ("YYYY-MM-DD") on the wall clock of `timezone` (the church's own zone). */
export function localDateIn(timezone: string, now: Date = new Date()): string {
  // The `en-CA` locale formats dates as year-month-day.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
