const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

/** "2026-11-16" → "16 nov"; undefined (a draft) → "—". */
export function formatShortDate(isoDate: string | undefined): string {
  if (!isoDate) return "—";
  const [, month, day] = isoDate.split("-");
  const monthName = MONTHS[Number(month) - 1];
  return monthName ? `${Number(day)} ${monthName}` : "—";
}

/** 1480 → "1.480" (manual grouping: es locales skip the dot on four digits); undefined → "—". */
export function formatCount(value: number | undefined): string {
  if (value === undefined) return "—";
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 41200 → "41,2 mil"; 18400 → "18,4 mil"; below 1000 it stays as is. */
export function formatCompactCount(value: number): string {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1).replace(".", ",").replace(/,0$/, "")} mil`;
}
