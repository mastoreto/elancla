import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Voucher } from "../../types";

export const VOUCHERS_PAGE_SIZE = 5;

export interface VoucherFilters {
  searchQuery: string;
  responsible: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function filterVouchers(vouchers: Voucher[], filters: VoucherFilters): Voucher[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return vouchers
    .filter((voucher) => {
      if (filters.responsible !== "all" && voucher.responsible !== filters.responsible)
        return false;
      if (query && !`${voucher.description} ${voucher.responsible}`.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.dateFrom && voucher.date < filters.dateFrom) return false;
      if (filters.dateTo && voucher.date > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function paginateVouchers(vouchers: Voucher[], page: number): Voucher[] {
  const start = (page - 1) * VOUCHERS_PAGE_SIZE;
  return vouchers.slice(start, start + VOUCHERS_PAGE_SIZE);
}

export function getUniqueResponsibles(vouchers: Voucher[]): string[] {
  return [...new Set(vouchers.map((voucher) => voucher.responsible))].sort();
}

/** "8 mar" for list rows. */
export function formatShortDate(date: Date): string {
  return format(date, "d MMM", { locale: es });
}

export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
