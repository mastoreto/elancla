import { formatMoney } from "@/lib/format-money";
import type { Movement } from "@/lib/types";

export const MOVEMENTS_PAGE_SIZE = 8;

export interface MovementFilters {
  searchQuery: string;
  currency: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function filterMovements(movements: Movement[], filters: MovementFilters): Movement[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return movements
    .filter((movement) => {
      if (filters.currency !== "all" && movement.currency !== filters.currency) return false;
      if (query) {
        const haystack = [movement.concept, movement.description, movement.project]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      const date = new Date(movement.date);
      if (filters.dateFrom && date < filters.dateFrom) return false;
      if (filters.dateTo && date > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function paginateMovements(movements: Movement[], page: number): Movement[] {
  const start = (page - 1) * MOVEMENTS_PAGE_SIZE;
  return movements.slice(start, start + MOVEMENTS_PAGE_SIZE);
}

/** "+ $U 45.000" for income and "− $U 8.500" (true minus sign) for expenses. */
export function formatMovementAmount(
  movement: Pick<Movement, "type" | "amount" | "currency">,
): string {
  const sign = movement.type === "income" ? "+" : "−";
  return `${sign} ${formatMoney(movement.amount, movement.currency)}`;
}
