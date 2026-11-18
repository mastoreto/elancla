const CURRENCY_PREFIX: Record<string, string> = { UYU: "$U", USD: "USD" };

/** "$U 15.000" for pesos and "USD 320" for dollars, as the boards write amounts. */
export function formatMoney(amount: number, currency: string): string {
  // Manual grouping: es locales skip the dot on four-digit numbers ("4500").
  const grouped = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${CURRENCY_PREFIX[currency] ?? currency} ${grouped}`;
}
