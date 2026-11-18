"use client";

import { Pencil, Play, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { ContentStatusPill, ContentTable } from "@/components/dashboard/content";
import { getChurchRoutePath } from "@/lib/church";
import { formatCount, formatShortDate } from "@/lib/format-content";
import { cn } from "@/lib/utils";
import type { Sermon } from "../types";
import { describeSeries } from "../utils";

const COLUMNS = "1.7fr 1.2fr 110px 80px 120px 130px";
const LABELS = ["Sermón", "Serie", "Estado", "Fecha", "Reproducciones", ""];

const sermonsTableSermonsPage = {
  muted: cn("text-sm text-[var(--tinta-suave)]"),
  plays: cn("font-bold tabular-nums"),
  icon: cn("size-4"),
};

interface SermonsTableProps {
  /** Sermons visible on the current page. */
  sermons: Sermon[];
  /** Whole library, used to tell real series from one-offs. */
  library: Sermon[];
  onDelete: (id: string) => void;
  footer: React.ReactNode;
}

export function SermonsTable({ sermons, library, onDelete, footer }: SermonsTableProps) {
  return (
    <ContentTable
      columns={COLUMNS}
      emptyMessage="No hay sermones encontrados."
      footer={footer}
      labels={LABELS}
      rows={sermons.map((sermon) => ({
        id: sermon.id,
        icon: Play,
        tone: "rose",
        title: sermon.title,
        subtitle: `${sermon.preacher} · ${sermon.passage}`,
        href: getChurchRoutePath("sermons", "new"),
        cells: [
          <span className={sermonsTableSermonsPage.muted} key="series">
            {describeSeries(sermon, library)}
          </span>,
          <ContentStatusPill key="status" status={sermon.status} />,
          <span className={sermonsTableSermonsPage.muted} key="date">
            {formatShortDate(sermon.date)}
          </span>,
          <b className={sermonsTableSermonsPage.plays} key="plays">
            {formatCount(sermon.plays)}
          </b>,
        ],
        actions: (
          <>
            <a
              aria-label={`Ver ${sermon.title} en YouTube`}
              className={rowIconButtonClass}
              href={sermon.youtubeUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Play aria-hidden="true" className={sermonsTableSermonsPage.icon} />
            </a>
            <RowIconButton
              href={getChurchRoutePath("sermons", "new")}
              label={`Editar ${sermon.title}`}
            >
              <Pencil aria-hidden="true" className={sermonsTableSermonsPage.icon} />
            </RowIconButton>
            <BoardConfirmDialog
              confirmLabel="Eliminar sermón"
              description={`«${sermon.title}» dejará de estar en la biblioteca y en el sitio. No se puede deshacer.`}
              onConfirm={() => onDelete(sermon.id)}
              title="¿Eliminar este sermón?"
              trigger={
                <button
                  aria-label={`Eliminar ${sermon.title}`}
                  className={rowIconButtonClass}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className={sermonsTableSermonsPage.icon} />
                </button>
              }
            />
          </>
        ),
      }))}
    />
  );
}
