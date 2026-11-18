"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const listPaginationSharedPage = {
  container: cn("flex flex-col items-center justify-between gap-3 sm:flex-row"),
  summary: cn("text-sm text-muted-foreground"),
  controls: cn("flex items-center gap-1"),
  pageButton: cn("size-9 tabular-nums"),
};

export function ListPagination({ page, pageSize, total, onPageChange }: ListPaginationProps) {
  if (total === 0) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginación" className={listPaginationSharedPage.container}>
      <p className={listPaginationSharedPage.summary}>
        Mostrando {first}–{last} de {total}
      </p>
      <div className={listPaginationSharedPage.controls}>
        <Button
          aria-label="Página anterior"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          size="icon"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        {pages.map((number) => (
          <Button
            aria-current={number === page ? "page" : undefined}
            className={listPaginationSharedPage.pageButton}
            key={number}
            onClick={() => onPageChange(number)}
            size="icon"
            variant={number === page ? "default" : "outline"}
          >
            {number}
          </Button>
        ))}
        <Button
          aria-label="Página siguiente"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          size="icon"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
