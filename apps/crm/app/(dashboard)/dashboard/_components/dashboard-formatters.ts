import type { Currency } from "@/lib/types";

const currencyLocales: Record<Currency, string> = {
  UYU: "es-UY",
  USD: "en-US",
};

const shortMonths = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Dic",
];

export function formatCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat(currencyLocales[currency], {
    compactDisplay: "short",
    currency,
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(amount);
}

export function formatShortDate(dateString: string) {
  const [, month, day] = dateString.split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${shortMonths[month - 1] ?? ""}`;
}
