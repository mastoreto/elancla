"use client";

import { PERMISSIONS } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { SearchField } from "@/components/dashboard/board/search-field";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { Can } from "@/lib/authz/Gate";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { AssemblyReport } from "../types";
import {
  type AssemblyFilter,
  filterAssemblyReports,
  summarizeAssembly,
} from "../utils/assembly-view";
import { AssemblyTable } from "./assembly-table";

const PAGE_SIZE = 5;

const FILTER_CHIPS: { value: AssemblyFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abiertos" },
  { value: "scheduled", label: "Programados" },
  { value: "expired", label: "Vencidos" },
  { value: "revoked", label: "Dados de baja" },
];

const assemblyListPageContentAssemblyPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  icon: cn("size-4"),
  toolbar: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  card: cn("p-[18px]"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function AssemblyListPageContent({ reports }: { reports: readonly AssemblyReport[] }) {
  const [filter, setFilter] = useState<AssemblyFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const summary = useMemo(() => summarizeAssembly(reports), [reports]);
  const filtered = useMemo(
    () => filterAssemblyReports(reports, filter, search),
    [reports, filter, search],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeFilter = (next: AssemblyFilter) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div className={assemblyListPageContentAssemblyPage.page}>
      <div className={assemblyListPageContentAssemblyPage.header}>
        <p className={assemblyListPageContentAssemblyPage.description}>
          Comparte informes completos con los asistentes mediante un código, solo durante la sesión
          y en el lugar.
        </p>
        <Can permission={PERMISSIONS.voting.create}>
          <BoardButton
            className={assemblyListPageContentAssemblyPage.action}
            href={getChurchRoutePath("assembly", "new")}
            variant="primary"
          >
            <Plus aria-hidden="true" className={assemblyListPageContentAssemblyPage.icon} />
            Publicar informe
          </BoardButton>
        </Can>
      </div>

      <StatCardGrid>
        <StatCard
          detail={summary.openAssembly}
          highlighted={true}
          label="Abiertas ahora"
          value={String(summary.open)}
        />
        <StatCard
          detail="Próxima: 8 de diciembre"
          label="Programadas"
          value={String(summary.scheduled)}
        />
        <StatCard
          detail={`${summary.lastAccesses} en la última asamblea`}
          label="Accesos este mes"
          value={String(summary.accesses)}
        />
        <StatCard
          detail="Intentos fuera del lugar"
          label="Bloqueados por ubicación"
          value={String(summary.blocked)}
        />
      </StatCardGrid>

      <div className={assemblyListPageContentAssemblyPage.toolbar}>
        <SearchField
          aria-label="Buscar informe"
          className={assemblyListPageContentAssemblyPage.search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por informe o código…"
          value={search}
        />
        {FILTER_CHIPS.map(({ value, label }) => (
          <FilterChip active={filter === value} key={value} onClick={() => changeFilter(value)}>
            {label}
          </FilterChip>
        ))}
      </div>

      <BoardCard className={assemblyListPageContentAssemblyPage.card}>
        {visible.length === 0 ? (
          <p className={assemblyListPageContentAssemblyPage.empty}>No hay informes encontrados.</p>
        ) : (
          <AssemblyTable reports={visible} />
        )}
        <BoardPagination
          onPageChange={setPage}
          page={page}
          pageCount={pageCount}
          pageSize={PAGE_SIZE}
          total={filtered.length}
        />
      </BoardCard>
    </div>
  );
}
