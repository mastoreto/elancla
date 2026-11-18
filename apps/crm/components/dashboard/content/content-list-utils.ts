export type ContentStatusFilter = "all" | "published" | "draft";

export interface ContentFilters {
  status: ContentStatusFilter;
  search: string;
  /** Series or category label; empty means every group. */
  group: string;
}

interface Filterable {
  status: "published" | "draft" | "paused";
  group: string;
  searchText: string;
}

/** Filters list items by status chip, series/category select and free text. */
export function filterContent<T extends Filterable>(items: T[], filters: ContentFilters): T[] {
  const query = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.group && item.group !== filters.group) return false;
    return !query || item.searchText.toLowerCase().includes(query);
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), pageCount);

  return {
    page: current,
    pageCount,
    items: items.slice((current - 1) * pageSize, current * pageSize),
  };
}
