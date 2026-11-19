"use client";

import { PERMISSIONS } from "@ancla/contracts";
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
import type { Podcast } from "../types";
import { getAverageMinutes, getSeriesNames, getTotalPlays, PODCASTS_PAGE_SIZE } from "../utils";
import { PodcastsTable } from "./podcasts-table";

const podcastsPageContentPodcastsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  icon: cn("size-4"),
};

export function PodcastsPageContent({ podcasts: initialPodcasts }: { podcasts: Podcast[] }) {
  const [podcasts, setPodcasts] = useState(initialPodcasts);
  const [filters, setFilters] = useState<ContentFilters>({ status: "all", search: "", group: "" });
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      filterContent(
        podcasts.map((podcast) => ({
          ...podcast,
          group: podcast.series.label,
          searchText: `${podcast.title} ${podcast.host.name} ${podcast.series.label}`,
        })),
        filters,
      ),
    [podcasts, filters],
  );
  const paged = paginate(filtered, page, PODCASTS_PAGE_SIZE);
  const series = getSeriesNames(podcasts);
  const published = podcasts.filter((podcast) => podcast.status === "published").length;

  return (
    <div className={podcastsPageContentPodcastsPage.page}>
      <div className={podcastsPageContentPodcastsPage.header}>
        <p className={podcastsPageContentPodcastsPage.description}>
          Gestiona y publica los episodios del podcast de la iglesia.
        </p>
        <Can permission={PERMISSIONS.content.create}>
          <BoardButton
            className={podcastsPageContentPodcastsPage.action}
            href={getChurchRoutePath("podcasts", "new")}
            variant="primary"
          >
            <Plus aria-hidden="true" className={podcastsPageContentPodcastsPage.icon} />
            Nuevo episodio
          </BoardButton>
        </Can>
      </div>

      <ContentSectionTabs current="podcasts" />

      <StatCardGrid>
        <StatCard
          detail={`${series.length} series`}
          label="Episodios"
          value={String(podcasts.length)}
        />
        <StatCard detail="2 este mes" label="Publicados" value={String(published)} />
        <StatCard
          detail="+9 % vs. mes anterior"
          label="Reproducciones"
          value={formatCompactCount(getTotalPlays(podcasts))}
        />
        <StatCard
          detail="Última semana"
          highlighted={true}
          label="Duración media"
          value={`${getAverageMinutes(podcasts)} min`}
        />
      </StatCardGrid>

      <ContentListToolbar
        filters={filters}
        groupLabel="Serie"
        groups={series}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        searchLabel="Buscar episodio"
        searchPlaceholder="Buscar episodio…"
      />

      <PodcastsTable
        footer={
          <BoardPagination
            onPageChange={setPage}
            page={paged.page}
            pageCount={paged.pageCount}
            pageSize={PODCASTS_PAGE_SIZE}
            total={filtered.length}
          />
        }
        onDelete={(id) => setPodcasts((current) => current.filter((podcast) => podcast.id !== id))}
        podcasts={paged.items}
      />
    </div>
  );
}
