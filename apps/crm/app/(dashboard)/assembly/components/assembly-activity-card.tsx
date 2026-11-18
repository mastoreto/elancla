import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardTimeline } from "@/components/dashboard/board/board-timeline";
import { cn } from "@/lib/utils";
import { CLOSED_ACTIVITY, OPEN_ACTIVITY } from "../data/assembly-panel-samples";
import type { AssemblyPanelMode } from "../utils/assembly-view";
import { AssemblyLiveBars } from "./assembly-live-bars";

const assemblyActivityCardAssemblyPage = {
  card: cn("p-6"),
};

export function AssemblyActivityCard({ mode }: { mode: AssemblyPanelMode }) {
  const live = mode === "open";

  return (
    <BoardCard className={assemblyActivityCardAssemblyPage.card}>
      <BoardCardHeader
        subtitle={live ? "Accesos por minuto" : "Aún sin accesos"}
        title={live ? "Actividad en vivo" : "Actividad"}
      />
      {live ? <AssemblyLiveBars /> : null}
      <BoardTimeline items={live ? OPEN_ACTIVITY : CLOSED_ACTIVITY} />
    </BoardCard>
  );
}
