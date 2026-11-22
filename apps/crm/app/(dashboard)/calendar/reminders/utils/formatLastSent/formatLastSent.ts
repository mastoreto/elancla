import { MONTH_SHORT_NAMES } from "../../../utils/dateLabels";

const NEVER_SENT = "Todavía no se envió ningún recordatorio.";

/** "Último envío: 14 mar 2026" from the wall-clock date of the last reminder, or a note if none. */
export function formatLastSent(lastSentOn: string | null): string {
  if (lastSentOn === null) return NEVER_SENT;
  const [year = 0, month = 1, day = 1] = lastSentOn.split("-").map(Number);
  return `Último envío: ${day} ${MONTH_SHORT_NAMES[month - 1]} ${year}`;
}
