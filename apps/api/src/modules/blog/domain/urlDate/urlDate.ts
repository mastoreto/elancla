/**
 * The `YYYY-MM-DD` an instant falls on in a time zone. It is the date of a post URL
 * (`Post.firstLiveAt`) and the `day` of a view (`new Date()`), always in the organization's zone.
 */
export function urlDate(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const part = (type: string): string =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
