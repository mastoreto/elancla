/** Month layout for a Monday-first grid: blank cells before day 1 and number of days. */
export function monthLayout(
  year: number,
  month: number
): { lead: number; days: number } {
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return { lead, days };
}
