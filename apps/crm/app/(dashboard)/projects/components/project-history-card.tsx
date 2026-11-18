import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CircleDollarSign, Folder, PencilLine, RefreshCw } from "lucide-react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardTimeline, type BoardTimelineItem } from "@/components/dashboard/board/board-timeline";
import type { ProjectHistoryEntry, ProjectStatus } from "@/lib/types";
import { PROJECT_STATUS_PILL } from "../utils";

interface ProjectHistoryCardProps {
  history: ProjectHistoryEntry[];
}

function getEntryTitle(entry: ProjectHistoryEntry): string {
  switch (entry.action) {
    case "created":
      return "Proyecto creado";
    case "status_changed": {
      const next = PROJECT_STATUS_PILL[entry.newValue as ProjectStatus]?.label;
      return next ? `Cambió a ${next}` : "Cambió de estado";
    }
    case "budget_updated":
      return "Presupuesto actualizado";
    default:
      return "Proyecto editado";
  }
}

const ENTRY_APPEARANCE = {
  created: { icon: Folder, tone: "gold" },
  status_changed: { icon: RefreshCw, tone: "ink" },
  budget_updated: { icon: CircleDollarSign, tone: "green" },
  edited: { icon: PencilLine, tone: "ink" },
} satisfies Record<ProjectHistoryEntry["action"], Pick<BoardTimelineItem, "icon" | "tone">>;

export function ProjectHistoryCard({ history }: ProjectHistoryCardProps) {
  const items: BoardTimelineItem[] = [...history]
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .map((entry) => ({
      id: entry.id,
      ...ENTRY_APPEARANCE[entry.action],
      title: getEntryTitle(entry),
      detail: entry.details,
      time: format(parseISO(entry.date), "d MMM · HH:mm", { locale: es }),
      dateTime: entry.date,
    }));

  return (
    <BoardCard>
      <BoardCardHeader title="Historial" />
      <BoardTimeline items={items} />
    </BoardCard>
  );
}
