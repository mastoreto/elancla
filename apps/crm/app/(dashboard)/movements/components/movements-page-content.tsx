"use client";

import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CreateMovementDialog } from "@/components/create-movement-dialog";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { Can } from "@/lib/authz/Gate";
import { movements as seedMovements } from "@/lib/data";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { filterMovements, MOVEMENTS_PAGE_SIZE, paginateMovements } from "../utils";
import { MovementsTable } from "./movements-table";
import { MovementsToolbar } from "./movements-toolbar";

const movementsPageContentMovementsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  actions: cn("flex shrink-0 gap-2.5"),
  actionIcon: cn("size-4"),
};

export function MovementsPageContent() {
  const [movements, setMovements] = useState<Movement[]>(seedMovements);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      filterMovements(movements, {
        searchQuery,
        currency,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
      }),
    [movements, searchQuery, currency, dateRange],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / MOVEMENTS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  // Any filter change returns to page one so results never look empty.
  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const clearFilters = () => {
    setSearchQuery("");
    setCurrency("all");
    setDateRange(undefined);
    setPage(1);
  };

  const createMovement = (movement: Omit<Movement, "id">) => {
    setMovements((previous) => [{ ...movement, id: String(previous.length + 1) }, ...previous]);
  };

  return (
    <div className={movementsPageContentMovementsPage.page}>
      <div className={movementsPageContentMovementsPage.header}>
        <p className={movementsPageContentMovementsPage.description}>
          Registro de ingresos y egresos de la iglesia en pesos y dólares.
        </p>
        <div className={movementsPageContentMovementsPage.actions}>
          <BoardButton variant="outline">
            <Download aria-hidden="true" className={movementsPageContentMovementsPage.actionIcon} />
            Exportar
          </BoardButton>
          <Can permission="movements:create">
            <BoardButton onClick={() => setIsCreateOpen(true)} variant="primary">
              <Plus aria-hidden="true" className={movementsPageContentMovementsPage.actionIcon} />
              Nuevo movimiento
            </BoardButton>
          </Can>
        </div>
      </div>

      <MovementsToolbar
        currency={currency}
        dateRange={dateRange}
        onClear={clearFilters}
        onCurrencyChange={withFirstPage(setCurrency)}
        onDateRangeChange={withFirstPage(setDateRange)}
        onSearchChange={withFirstPage(setSearchQuery)}
        searchQuery={searchQuery}
      />

      <MovementsTable
        movements={paginateMovements(filtered, currentPage)}
        onPageChange={setPage}
        page={currentPage}
        pageCount={pageCount}
        total={filtered.length}
      />

      <CreateMovementDialog
        onOpenChange={setIsCreateOpen}
        onSubmit={createMovement}
        open={isCreateOpen}
      />
    </div>
  );
}
