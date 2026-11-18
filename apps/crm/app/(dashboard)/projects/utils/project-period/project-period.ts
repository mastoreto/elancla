import { differenceInCalendarWeeks, endOfMonth, format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const monthShort = (date: Date) => format(date, "MMM", { locale: es });

/**
 * "ene – dic 2026", "1 – 15 jun 2026", "jul 2026", "jul 2025 – mar 2026".
 * Day precision is only written when the range does not span whole months.
 */
export function formatProjectPeriod(startDate: string, endDate?: string): string {
  const start = parseISO(startDate);
  if (!endDate) return format(start, "MMM yyyy", { locale: es });

  const end = parseISO(endDate);
  const wholeMonths = start.getDate() === 1 && isSameDay(end, endOfMonth(end));
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();

  if (!wholeMonths) {
    return sameMonth
      ? `${start.getDate()} – ${end.getDate()} ${monthShort(end)} ${end.getFullYear()}`
      : `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`;
  }
  if (sameMonth) return `${monthShort(start)} ${start.getFullYear()}`;
  if (start.getFullYear() === end.getFullYear()) {
    return `${monthShort(start)} – ${monthShort(end)} ${end.getFullYear()}`;
  }
  return `${monthShort(start)} ${start.getFullYear()} – ${monthShort(end)} ${end.getFullYear()}`;
}

/** "Faltan 6 semanas", "Finalizó hace 3 semanas" or an empty string when there is no end date. */
export function describeTimeRemaining(endDate: string | undefined, today: Date): string {
  if (!endDate) return "";
  const weeks = differenceInCalendarWeeks(parseISO(endDate), today, { weekStartsOn: 1 });
  if (weeks === 0) return "Termina esta semana";
  const count = Math.abs(weeks);
  const unit = count === 1 ? "semana" : "semanas";
  return weeks > 0 ? `Faltan ${count} ${unit}` : `Finalizó hace ${count} ${unit}`;
}
