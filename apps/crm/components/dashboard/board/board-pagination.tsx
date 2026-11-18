"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const boardPaginationDashboardPage = {
  container: cn("flex flex-wrap items-center gap-3 pt-2.5"),
  summary: cn("flex-1 text-[13px] text-[var(--tinta-apagada)]"),
  controls: cn("flex items-center gap-1"),
  arrow: cn(
    "inline-flex size-[38px] items-center justify-center rounded-full bg-card text-foreground",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] disabled:opacity-40",
  ),
  page: cn("inline-flex size-[38px] items-center justify-center rounded-full text-sm font-bold"),
  pageActive: cn("bg-foreground text-white"),
  pageIdle: cn("text-foreground hover:bg-secondary"),
  gap: cn(
    "inline-flex size-[38px] items-center justify-center text-sm font-bold text-[var(--tinta-apagada)]",
  ),
};

type PageItem = number | "gap-start" | "gap-end";

/** 1 2 3 … 12: always the first and last page, plus the neighbors of the current one. */
function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const middle = [page - 1, page, page + 1].filter((value) => value > 1 && value < pageCount);
  const items: PageItem[] = [1];
  if (middle[0] !== undefined && middle[0] > 2) {
    items.push("gap-start");
  }
  items.push(...middle);
  if (middle.at(-1) !== undefined && (middle.at(-1) as number) < pageCount - 1) {
    items.push("gap-end");
  }
  items.push(pageCount);
  return items;
}

interface BoardPaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function BoardPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: BoardPaginationProps) {
  if (total === 0) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Paginación" className={boardPaginationDashboardPage.container}>
      <span className={boardPaginationDashboardPage.summary}>
        Mostrando {first}–{last} de {total}
      </span>
      <div className={boardPaginationDashboardPage.controls}>
        <button
          aria-label="Página anterior"
          className={boardPaginationDashboardPage.arrow}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        {getPageItems(page, pageCount).map((item) =>
          typeof item === "string" ? (
            <span className={boardPaginationDashboardPage.gap} key={item}>
              …
            </span>
          ) : (
            <button
              aria-current={item === page ? "page" : undefined}
              className={cn(
                boardPaginationDashboardPage.page,
                item === page
                  ? boardPaginationDashboardPage.pageActive
                  : boardPaginationDashboardPage.pageIdle,
              )}
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {item}
            </button>
          ),
        )}
        <button
          aria-label="Página siguiente"
          className={boardPaginationDashboardPage.arrow}
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  );
}
