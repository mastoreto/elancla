import { BarChart3, CircleDollarSign, Plus, Upload } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const quickActionsCardDashboardPage = {
  grid: cn("grid grid-cols-2 gap-2.5"),
  action: cn("w-full"),
  icon: cn("size-[17px]"),
};

export function QuickActionsCard() {
  return (
    <BoardCard>
      <BoardCardHeader title="Acciones rápidas" />
      <div className={quickActionsCardDashboardPage.grid}>
        <BoardButton
          className={quickActionsCardDashboardPage.action}
          href={getChurchRoutePath("movements")}
          variant="primary"
        >
          <Plus aria-hidden="true" className={quickActionsCardDashboardPage.icon} />
          Nuevo movimiento
        </BoardButton>
        <BoardButton
          className={quickActionsCardDashboardPage.action}
          href={getChurchRoutePath("requests")}
        >
          <CircleDollarSign aria-hidden="true" className={quickActionsCardDashboardPage.icon} />
          Nueva solicitud
        </BoardButton>
        <BoardButton
          className={quickActionsCardDashboardPage.action}
          href={getChurchRoutePath("receipts")}
        >
          <Upload aria-hidden="true" className={quickActionsCardDashboardPage.icon} />
          Subir boleta
        </BoardButton>
        <BoardButton
          className={quickActionsCardDashboardPage.action}
          href={getChurchRoutePath("reports")}
        >
          <BarChart3 aria-hidden="true" className={quickActionsCardDashboardPage.icon} />
          Crear informe
        </BoardButton>
      </div>
    </BoardCard>
  );
}
