"use client";

import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { ContentStatusPill, ContentTable } from "@/components/dashboard/content";
import { getChurchRoutePath } from "@/lib/church";
import { formatCount, formatShortDate } from "@/lib/format-content";
import { cn } from "@/lib/utils";
import type { BlogPost } from "../types";
import { getPrimaryCategory } from "../utils";

const COLUMNS = "1.8fr 1fr 110px 110px 90px 130px";
const LABELS = ["Título", "Categoría", "Estado", "Publicación", "Vistas", ""];

const blogTableContentPage = {
  muted: cn("text-sm text-[var(--tinta-suave)]"),
  views: cn("font-bold tabular-nums"),
  icon: cn("size-4"),
};

interface BlogTableProps {
  posts: BlogPost[];
  onDelete: (id: string) => void;
  footer: React.ReactNode;
}

export function BlogTable({ posts, onDelete, footer }: BlogTableProps) {
  return (
    <ContentTable
      columns={COLUMNS}
      emptyMessage="No hay artículos encontrados."
      footer={footer}
      labels={LABELS}
      rows={posts.map((post) => ({
        id: post.id,
        icon: FileText,
        tone: "rose",
        title: post.title,
        subtitle: post.author.name,
        href: getChurchRoutePath("blog", "new"),
        cells: [
          <span className={blogTableContentPage.muted} key="category">
            {getPrimaryCategory(post)}
          </span>,
          <ContentStatusPill key="status" status={post.status} />,
          <span className={blogTableContentPage.muted} key="date">
            {formatShortDate(post.publishedAt)}
          </span>,
          <b className={blogTableContentPage.views} key="views">
            {post.status === "published" ? formatCount(post.views) : "—"}
          </b>,
        ],
        actions: (
          <>
            <RowIconButton href={getChurchRoutePath("blog", "new")} label={`Ver ${post.title}`}>
              <Eye aria-hidden="true" className={blogTableContentPage.icon} />
            </RowIconButton>
            <RowIconButton href={getChurchRoutePath("blog", "new")} label={`Editar ${post.title}`}>
              <Pencil aria-hidden="true" className={blogTableContentPage.icon} />
            </RowIconButton>
            <BoardConfirmDialog
              confirmLabel="Eliminar artículo"
              description={`«${post.title}» dejará de estar en el blog. No se puede deshacer.`}
              onConfirm={() => onDelete(post.id)}
              title="¿Eliminar este artículo?"
              trigger={
                <button
                  aria-label={`Eliminar ${post.title}`}
                  className={rowIconButtonClass}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className={blogTableContentPage.icon} />
                </button>
              }
            />
          </>
        ),
      }))}
    />
  );
}
