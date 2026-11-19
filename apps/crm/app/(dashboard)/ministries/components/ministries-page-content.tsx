"use client";

import { PERMISSIONS } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { Can } from "@/lib/authz/Gate";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { MinistryFilters, MinistrySummary, MinistryViewMode } from "../types";
import { DEFAULT_MINISTRY_FILTERS, filterMinistries, summarizeMinistries } from "../utils";
import { MinistriesSummary } from "./ministries-summary";
import { MinistriesTable } from "./ministries-table";
import { MinistriesToolbar } from "./ministries-toolbar";
import { MinistryCard } from "./ministry-card";

interface MinistriesPageContentProps {
  ministries: readonly MinistrySummary[];
}

const MINISTRIES_PAGE_SIZE = 12;

const ministriesPageContentMinistriesPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  actionIcon: cn("size-4"),
  grid: cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
  pagination: cn("pt-2.5"),
};

export function MinistriesPageContent({ ministries }: MinistriesPageContentProps) {
  const [viewMode, setViewMode] = useState<MinistryViewMode>("cards");
  const [filters, setFilters] = useState<MinistryFilters>(DEFAULT_MINISTRY_FILTERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterMinistries(ministries, filters), [ministries, filters]);
  const totals = useMemo(() => summarizeMinistries(ministries), [ministries]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / MINISTRIES_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * MINISTRIES_PAGE_SIZE,
    currentPage * MINISTRIES_PAGE_SIZE,
  );

  return (
    <div className={ministriesPageContentMinistriesPage.page}>
      <div className={ministriesPageContentMinistriesPage.header}>
        <p className={ministriesPageContentMinistriesPage.description}>
          Contenido del sitio web: cada ministerio con su descripción, líder y horarios. El
          presupuesto se gestiona aparte.
        </p>
        <Can permission={PERMISSIONS.ministryProfile.create}>
          <BoardButton
            className={ministriesPageContentMinistriesPage.action}
            href={getChurchRoutePath("ministries", "new")}
            variant="primary"
          >
            <Plus aria-hidden="true" className={ministriesPageContentMinistriesPage.actionIcon} />
            Nuevo ministerio
          </BoardButton>
        </Can>
      </div>

      <MinistriesSummary totals={totals} />

      <MinistriesToolbar
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {viewMode === "table" ? (
        <MinistriesTable ministries={visible} />
      ) : visible.length === 0 ? (
        <p className={ministriesPageContentMinistriesPage.empty}>No hay ministerios encontrados.</p>
      ) : (
        <div className={ministriesPageContentMinistriesPage.grid}>
          {visible.map((ministry) => (
            <MinistryCard key={ministry.id} ministry={ministry} />
          ))}
        </div>
      )}

      <div className={ministriesPageContentMinistriesPage.pagination}>
        <BoardPagination
          onPageChange={setPage}
          page={currentPage}
          pageCount={pageCount}
          pageSize={MINISTRIES_PAGE_SIZE}
          total={filtered.length}
        />
      </div>
    </div>
  );
}
