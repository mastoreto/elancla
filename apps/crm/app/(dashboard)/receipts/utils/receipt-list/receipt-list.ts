import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Receipt } from "../../types";

export const RECEIPTS_PAGE_SIZE = 4;

export interface ReceiptFilters {
  searchQuery: string;
  currency: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function filterReceipts(receipts: Receipt[], filters: ReceiptFilters): Receipt[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return receipts
    .filter((receipt) => {
      if (filters.currency !== "all" && receipt.currency !== filters.currency) return false;
      if (query && !`${receipt.number} ${receipt.provider}`.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.dateFrom && receipt.date < filters.dateFrom) return false;
      if (filters.dateTo && receipt.date > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function paginateReceipts(receipts: Receipt[], page: number): Receipt[] {
  const start = (page - 1) * RECEIPTS_PAGE_SIZE;
  return receipts.slice(start, start + RECEIPTS_PAGE_SIZE);
}

/** "4 mar" for list rows. */
export function formatShortDate(date: Date): string {
  return format(date, "d MMM", { locale: es });
}

/** "4 mar 2026" for detail panels. */
export function formatLongDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: es });
}

/** "Movimiento · Pago de renta" -> "Pago de renta": the list drops the kind prefix. */
export function stripRelationKind(relatedEntity: string): string {
  return relatedEntity.split(" · ").at(-1) ?? relatedEntity;
}
