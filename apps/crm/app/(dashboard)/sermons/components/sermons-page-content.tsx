"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import {
  type ContentFilters,
  ContentListToolbar,
  ContentSectionTabs,
  filterContent,
  paginate,
} from "@/components/dashboard/content";
import { Can } from "@/lib/authz/Gate";
import { getChurchRoutePath } from "@/lib/church";
import { formatCompactCount } from "@/lib/format-content";
import { cn } from "@/lib/utils";
import { sermons as seedSermons } from "../data/sermons";
import { getSeriesNames, getTotalPlays, SERMONS_PAGE_SIZE } from "../utils";
import { SermonsLiveBanner } from "./sermons-live-banner";
import { SermonsTable } from "./sermons-table";

const sermonsPageContentSermonsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  icon: cn("size-4"),
};

export function SermonsPageContent() {
  const [library, setLibrary] = useState(seedSermons);
  const [filters, setFilters] = useState<ContentFilters>({ status: "all", search: "", group: "" });
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      filterContent(
        library.map((sermon) => ({
          ...sermon,
          group: sermon.series,
          searchText: `${sermon.title} ${sermon.preacher} ${sermon.passage} ${sermon.series}`,
        })),
        filters,
      ),
    [library, filters],
  );
  const paged = paginate(filtered, page, SERMONS_PAGE_SIZE);
  const series = getSeriesNames(library);
  const published = library.filter((sermon) => sermon.status === "published").length;

  return (
    <div className={sermonsPageContentSermonsPage.page}>
      <div className={sermonsPageContentSermonsPage.header}>
        <p className={sermonsPageContentSermonsPage.description}>
          Biblioteca de prédicas con video de YouTube, pasaje bíblico y serie.
        </p>
        <Can permission="content:create">
          <BoardButton
            className={sermonsPageContentSermonsPage.action}
            href={getChurchRoutePath("sermons", "new")}
            variant="primary"
          >
            <Plus aria-hidden="true" className={sermonsPageContentSermonsPage.icon} />
            Nuevo sermón
          </BoardButton>
        </Can>
      </div>

      <ContentSectionTabs current="sermons" />

      <StatCardGrid>
        <StatCard
          detail={`${series.length} series`}
          label="Sermones"
          value={String(library.length)}
        />
        <StatCard detail="1 por semana" label="Publicados" value={String(published)} />
        <StatCard
          detail="+11 % vs. mes anterior"
          label="Reproducciones"
          value={formatCompactCount(getTotalPlays(library))}
        />
        <StatCard
          detail="Detección automática de YouTube"
          highlighted={true}
          label="Próximo directo"
          value="Dom 11:15"
        />
      </StatCardGrid>

      <SermonsLiveBanner />

      <ContentListToolbar
        filters={filters}
        groupLabel="Serie"
        groups={series}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        searchLabel="Buscar sermón"
        searchPlaceholder="Buscar sermón, predicador o pasaje…"
      />

      <SermonsTable
        footer={
          <BoardPagination
            onPageChange={setPage}
            page={paged.page}
            pageCount={paged.pageCount}
            pageSize={SERMONS_PAGE_SIZE}
            total={filtered.length}
          />
        }
        library={library}
        onDelete={(id) => setLibrary((current) => current.filter((sermon) => sermon.id !== id))}
        sermons={paged.items}
      />
    </div>
  );
}
