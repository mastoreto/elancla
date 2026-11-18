import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, ImageIcon, Link2, Upload } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import type { ProjectDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectDocumentsCardProps {
  documents: ProjectDocument[];
  canEdit: boolean;
}

const DOCUMENT_APPEARANCE = {
  pdf: { icon: FileText, tone: "rose" },
  image: { icon: ImageIcon, tone: "gold" },
  link: { icon: Link2, tone: "ink" },
} satisfies Record<ProjectDocument["type"], { icon: typeof FileText; tone: IconBubbleTone }>;

const projectDocumentsCardProjectsPage = {
  list: cn("flex flex-col gap-2.5"),
  item: cn("flex items-center gap-3"),
  bubble: cn("size-[38px]"),
  bubbleIcon: cn("size-[18px]"),
  text: cn("flex min-w-0 flex-col gap-0.5"),
  name: cn("truncate text-sm font-bold"),
  meta: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  upload: cn("h-9"),
  uploadIcon: cn("size-4"),
};

export function ProjectDocumentsCard({ documents, canEdit }: ProjectDocumentsCardProps) {
  const count = documents.length;

  return (
    <BoardCard>
      <BoardCardHeader
        action={
          canEdit ? (
            <BoardButton
              className={projectDocumentsCardProjectsPage.upload}
              size="sm"
              variant="soft"
            >
              <Upload aria-hidden="true" className={projectDocumentsCardProjectsPage.uploadIcon} />
              Subir
            </BoardButton>
          ) : null
        }
        subtitle={`${count} ${count === 1 ? "archivo" : "archivos"}`}
        title="Documentos"
      />
      {count === 0 ? (
        <p className={projectDocumentsCardProjectsPage.empty}>Todavía no hay documentos.</p>
      ) : (
        <ul className={projectDocumentsCardProjectsPage.list}>
          {documents.map((document) => {
            const { icon: Icon, tone } = DOCUMENT_APPEARANCE[document.type];
            return (
              <li className={projectDocumentsCardProjectsPage.item} key={document.id}>
                <IconBubble className={projectDocumentsCardProjectsPage.bubble} tone={tone}>
                  <Icon
                    aria-hidden="true"
                    className={projectDocumentsCardProjectsPage.bubbleIcon}
                  />
                </IconBubble>
                <div className={projectDocumentsCardProjectsPage.text}>
                  <span className={projectDocumentsCardProjectsPage.name}>{document.name}</span>
                  <span className={projectDocumentsCardProjectsPage.meta}>
                    {document.uploadedBy} ·{" "}
                    {format(parseISO(document.uploadedAt), "dd MMM", { locale: es })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </BoardCard>
  );
}
