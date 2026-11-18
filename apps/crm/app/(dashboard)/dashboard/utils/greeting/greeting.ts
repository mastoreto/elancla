const NOON_HOUR = 12;
const EVENING_HOUR = 19;

export function getGreeting(hour: number): string {
  if (hour < NOON_HOUR) {
    return "Buenos días";
  }
  return hour < EVENING_HOUR ? "Buenas tardes" : "Buenas noches";
}

/** "martes 17 de noviembre" */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("es-UY", { weekday: "long", day: "numeric", month: "long" })
    .format(date)
    .replace(",", "");
}
