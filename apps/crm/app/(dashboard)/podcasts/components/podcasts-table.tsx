"use client";

import { Mic, Pencil, Play, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { ContentStatusPill, ContentTable } from "@/components/dashboard/content";
import { getChurchRoutePath } from "@/lib/church";
import { formatCount } from "@/lib/format-content";
import { cn } from "@/lib/utils";
import type { Podcast } from "../types";
import { getDurationMinutes } from "../utils";

const COLUMNS = "1.7fr 1.2fr 110px 90px 120px 130px";
const LABELS = ["Episodio", "Serie", "Estado", "Duración", "Reproducciones", ""];

const podcastsTablePodcastsPage = {
  muted: cn("text-sm text-[var(--tinta-suave)]"),
  plays: cn("font-bold tabular-nums"),
  icon: cn("size-4"),
};

interface PodcastsTableProps {
  podcasts: Podcast[];
  onDelete: (id: string) => void;
  footer: React.ReactNode;
}

export function PodcastsTable({ podcasts, onDelete, footer }: PodcastsTableProps) {
  return (
    <ContentTable
      columns={COLUMNS}
      emptyMessage="No hay episodios encontrados."
      footer={footer}
      labels={LABELS}
      rows={podcasts.map((podcast) => {
        const isPublished = podcast.status === "published";
        return {
          id: podcast.id,
          icon: Mic,
          tone: "gold",
          title: podcast.title,
          subtitle: podcast.host.name,
          href: getChurchRoutePath("podcasts", "new"),
          cells: [
            <span className={podcastsTablePodcastsPage.muted} key="series">
              {podcast.series.label}
            </span>,
            <ContentStatusPill key="status" status={podcast.status} />,
            <span className={podcastsTablePodcastsPage.muted} key="duration">
              {isPublished ? `${getDurationMinutes(podcast.duration)} min` : "—"}
            </span>,
            <b className={podcastsTablePodcastsPage.plays} key="plays">
              {isPublished ? formatCount(podcast.plays) : "—"}
            </b>,
          ],
          actions: (
            <>
              <RowIconButton
                href={getChurchRoutePath("podcasts", "new")}
                label={`Escuchar ${podcast.title}`}
              >
                <Play aria-hidden="true" className={podcastsTablePodcastsPage.icon} />
              </RowIconButton>
              <RowIconButton
                href={getChurchRoutePath("podcasts", "new")}
                label={`Editar ${podcast.title}`}
              >
                <Pencil aria-hidden="true" className={podcastsTablePodcastsPage.icon} />
              </RowIconButton>
              <BoardConfirmDialog
                confirmLabel="Eliminar episodio"
                description={`«${podcast.title}» dejará de estar en el podcast. No se puede deshacer.`}
                onConfirm={() => onDelete(podcast.id)}
                title="¿Eliminar este episodio?"
                trigger={
                  <button
                    aria-label={`Eliminar ${podcast.title}`}
                    className={rowIconButtonClass}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className={podcastsTablePodcastsPage.icon} />
                  </button>
                }
              />
            </>
          ),
        };
      })}
    />
  );
}
