import { formatMoney } from "@/lib/format-money";
import type { MoneyRequest, RequestStatus } from "@/lib/types";

export const REQUESTS_PAGE_SIZE = 5;

export type RequestStatusFilter = RequestStatus | "all";

export interface RequestFilters {
  searchQuery: string;
  status: RequestStatusFilter;
  ministry: string;
}

export function filterRequests(requests: MoneyRequest[], filters: RequestFilters): MoneyRequest[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return requests
    .filter((request) => {
      if (filters.status !== "all" && request.status !== filters.status) return false;
      if (filters.ministry !== "all" && request.ministry !== filters.ministry) return false;
      if (query) {
        const haystack = [request.concept, request.ministry, request.leader, request.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function countByStatus(requests: MoneyRequest[]): Record<RequestStatusFilter, number> {
  return {
    all: requests.length,
    pending: requests.filter((request) => request.status === "pending").length,
    approved: requests.filter((request) => request.status === "approved").length,
    rejected: requests.filter((request) => request.status === "rejected").length,
  };
}

export function getPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / REQUESTS_PAGE_SIZE));
}

export function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * REQUESTS_PAGE_SIZE;
  return items.slice(start, start + REQUESTS_PAGE_SIZE);
}

export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** "$U 15.000" for pesos and "USD 320" for dollars, as the boards write amounts. */
export function formatRequestAmount(amount: number, currency: string): string {
  return formatMoney(amount, currency);
}
