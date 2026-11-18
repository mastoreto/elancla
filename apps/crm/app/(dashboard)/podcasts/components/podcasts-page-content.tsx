"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Eye,
  FileText,
  Headphones,
  Mic,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  Play,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { DashboardMetricStrip, DashboardPageHeader } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, parseLocalDate } from "@/lib/utils";
import { type ColumnDef, DataTable, type FilterConfig } from "@/src/components/DataTable";
import type { Podcast, PodcastHost, PodcastSeries } from "../types";
import { PodcastStatusBadge } from "./podcast-status-badge";

const podcastsPageContentContentPage = {
  count: cn("text-sm text-muted-foreground tabular-nums"),
};

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return format(parseLocalDate(dateStr), "dd MMM yyyy", { locale: es });
}

function formatPlays(plays: number): string {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}k`;
  return String(plays);
}

function usePodcastMetrics(podcasts: Podcast[]) {
  return useMemo(() => {
    const published = podcasts.filter((p) => p.status === "published");
    const totalPlays = podcasts.reduce((sum, p) => sum + p.plays, 0);
    const draftsAndPaused = podcasts.filter((p) => p.status === "draft" || p.status === "paused");

    return [
      {
        label: "Total episodios",
        value: String(podcasts.length),
        detail: "Todos los estados",
        icon: Headphones,
        tone: "neutral" as const,
      },
      {
        label: "Publicados",
        value: String(published.length),
        detail: "En vivo ahora",
        icon: Mic,
        tone: "up" as const,
        accent: true,
      },
      {
        label: "Reproducciones",
        value: formatPlays(totalPlays),
        detail: "Acumuladas",
        icon: Play,
        tone: "neutral" as const,
      },
      {
        label: "Borradores",
        value: String(draftsAndPaused.length),
        detail: "Sin publicar",
        icon: FileText,
        tone: "neutral" as const,
      },
    ];
  }, [podcasts]);
}

function buildColumns(
  onPauseToggle: (podcast: Podcast) => void,
  onDelete: (podcast: Podcast) => void,
): ColumnDef<Podcast>[] {
  return [
    {
      key: "title",
      label: "Episodio",
      render: (podcast) => (
        <div className="max-w-[280px]">
          <p className="font-medium text-foreground truncate">{podcast.title}</p>
          <p className="text-xs text-muted-foreground">
            T{podcast.season} · Ep. {podcast.episode}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (podcast) => <PodcastStatusBadge status={podcast.status} />,
    },
    {
      key: "plays",
      label: "Reproducciones",
      render: (podcast) => (
        <span className="tabular-nums text-sm font-medium">{formatPlays(podcast.plays)}</span>
      ),
    },
    {
      key: "series",
      label: "Serie",
      render: (podcast) => (
        <Badge variant="secondary" className="text-xs font-normal">
          {podcast.series.label}
        </Badge>
      ),
    },
    {
      key: "duration",
      label: "Duración",
      render: (podcast) => (
        <span className={podcastsPageContentContentPage.count}>{podcast.duration}</span>
      ),
    },
    {
      key: "publishedAt",
      label: "Publicación",
      render: (podcast) => (
        <span className={podcastsPageContentContentPage.count}>
          {formatDate(podcast.publishedAt)}
        </span>
      ),
    },
    {
      key: "host",
      label: "Presentador",
      render: (podcast) => <span className="text-sm">{podcast.host.name}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-[1%] whitespace-nowrap",
      render: (podcast) => (
        <RowActions podcast={podcast} onPauseToggle={onPauseToggle} onDelete={onDelete} />
      ),
    },
  ];
}

function buildFilters(hosts: PodcastHost[], series: PodcastSeries[]): FilterConfig<Podcast>[] {
  return [
    {
      key: "title",
      type: "text",
      label: "Buscar",
      placeholder: "Buscar por título...",
      getValue: (podcast) => podcast.title,
    },
    {
      key: "publishedAt",
      type: "daterange",
      label: "Fecha de publicación",
      getValue: (podcast) => podcast.publishedAt ?? "",
    },
    {
      key: "host",
      type: "select",
      label: "Presentador",
      placeholder: "Todos los presentadores",
      options: hosts.map((h) => ({ value: h.id, label: h.name })),
      getValue: (podcast) => podcast.host.id,
    },
    {
      key: "series",
      type: "select",
      label: "Serie",
      placeholder: "Todas las series",
      options: series.map((s) => ({ value: s.id, label: s.label })),
      getValue: (podcast) => podcast.series.id,
    },
  ];
}

interface RowActionsProps {
  podcast: Podcast;
  onPauseToggle: (podcast: Podcast) => void;
  onDelete: (podcast: Podcast) => void;
}

function RowActions({ podcast, onPauseToggle, onDelete }: RowActionsProps) {
  const isPaused = podcast.status === "paused";
  const isDraft = podcast.status === "draft";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info("Próximamente: reproductor de episodio")}>
          <Eye className="size-4" />
          Ver
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => toast.info("Próximamente: editor de episodio")}>
          <Pencil className="size-4" />
          Editar
        </DropdownMenuItem>

        <DropdownMenuItem disabled={isDraft} onClick={() => onPauseToggle(podcast)}>
          {isPaused ? (
            <>
              <PlayCircle className="size-4" />
              Reanudar
            </>
          ) : (
            <>
              <PauseCircle className="size-4" />
              Pausar
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(podcast)}
        >
          <Trash2 className="size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PodcastsPageContentProps {
  podcasts: Podcast[];
  hosts: PodcastHost[];
  series: PodcastSeries[];
}

export function PodcastsPageContent({ podcasts, hosts, series }: PodcastsPageContentProps) {
  const metrics = usePodcastMetrics(podcasts);

  const columns = useMemo(
    () =>
      buildColumns(
        (podcast) => {
          const next = podcast.status === "paused" ? "published" : "paused";
          toast.success(`"${podcast.title}" ${next === "paused" ? "pausado" : "reanudado"}`);
        },
        (podcast) => {
          toast.error(`Eliminar "${podcast.title}"`, {
            description: "Esta acción no se puede deshacer.",
            action: {
              label: "Confirmar",
              onClick: () => toast.success("Episodio eliminado"),
            },
          });
        },
      ),
    [],
  );

  const filters = useMemo(() => buildFilters(hosts, series), [hosts, series]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        kicker="Contenido"
        title="Podcasts"
        emphasis="episodios"
        description="Gestiona y publica los episodios del podcast de la iglesia."
      />

      <DashboardMetricStrip metrics={metrics} />

      <DataTable
        data={podcasts}
        columns={columns}
        filters={filters}
        pageSize={10}
        keyExtractor={(podcast) => podcast.id}
        emptyMessage="No se encontraron episodios con esos filtros"
      />
    </div>
  );
}
