const CURRENCY_PREFIX: Record<string, string> = { UYU: "$U", USD: "USD" };

/** "$U 15.000" for pesos and "USD 320" for dollars, as the boards write amounts. */
export function formatMoney(amount: number, currency: string): string {
  // Manual grouping: es locales skip the dot on four-digit numbers ("4500").
  const grouped = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${CURRENCY_PREFIX[currency] ?? currency} ${grouped}`;
}

type CompactUnit = "auto" | "million";

/**
 * Short amounts for cards: "$U 185 mil" or "$U 2,1 M".
 * `auto` writes thousands as "mil" and millions as "M"; `million` always uses "M".
 */
export function formatMoneyCompact(
  amount: number,
  currency: string,
  unit: CompactUnit = "auto",
): string {
  const prefix = CURRENCY_PREFIX[currency] ?? currency;
  const asMillions = unit === "million" || amount >= 1_000_000;

  if (asMillions) {
    const millions = (amount / 1_000_000).toFixed(1).replace(".", ",");
    return `${prefix} ${millions} M`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    // Under 100 mil a decimal keeps the figure honest ("8,2 mil"); above it the integer is enough.
    const text =
      thousands < 100
        ? thousands.toFixed(1).replace(".", ",").replace(/,0$/, "")
        : String(Math.round(thousands));
    return `${prefix} ${text} mil`;
  }
  return formatMoney(amount, currency);
}
