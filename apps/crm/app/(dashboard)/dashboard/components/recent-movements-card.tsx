import { ChevronRight, CircleDollarSign, Heart } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { RecentMovement } from "../data/summary";

const KIND = {
  income: { label: "Ingreso", bubble: "green", pill: "green", amount: cn("text-[var(--vida)]") },
  expense: { label: "Egreso", bubble: "rose", pill: "rose", amount: cn("text-primary") },
} as const;

const recentMovementsCardDashboardPage = {
  table: cn("flex flex-col gap-1"),
  head: cn(
    "grid grid-cols-[1.6fr_110px_140px] items-center gap-3.5 rounded-[14px] bg-secondary px-[18px] py-3",
  ),
  headCell: cn("text-xs font-bold text-[var(--tinta-suave)]"),
  row: cn(
    "grid grid-cols-[1fr_auto] items-center gap-3.5 rounded-2xl border-b border-[rgba(42,21,26,0.08)] px-[18px] py-[13px] text-sm",
    "sm:grid-cols-[1.6fr_110px_140px]",
  ),
  concept: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-[38px]"),
  text: cn("flex min-w-0 flex-col gap-0.5"),
  name: cn("truncate font-bold"),
  note: cn("truncate text-[12.5px] text-[var(--tinta-apagada)]"),
  kind: cn("hidden sm:block"),
  amount: cn("text-right tabular-nums whitespace-nowrap"),
};

interface RecentMovementsCardProps {
  movements: RecentMovement[];
}

export function RecentMovementsCard({ movements }: RecentMovementsCardProps) {
  return (
    <BoardCard>
      <BoardCardHeader
        action={
          <BoardButton href={getChurchRoutePath("movements")} size="sm" variant="soft">
            <ChevronRight aria-hidden="true" className="size-4" />
            Ver todos
          </BoardButton>
        }
        subtitle={`Últimos ${movements.length} registros`}
        title="Movimientos recientes"
      />
      <div className={recentMovementsCardDashboardPage.table}>
        <div className={recentMovementsCardDashboardPage.head}>
          <span className={recentMovementsCardDashboardPage.headCell}>Concepto</span>
          <span className={recentMovementsCardDashboardPage.headCell}>Tipo</span>
          <span className={recentMovementsCardDashboardPage.headCell}>Monto</span>
        </div>
        {movements.map((movement) => {
          const kind = KIND[movement.kind];
          return (
            <div className={recentMovementsCardDashboardPage.row} key={movement.id}>
              <div className={recentMovementsCardDashboardPage.concept}>
                <IconBubble className={recentMovementsCardDashboardPage.bubble} tone={kind.bubble}>
                  {movement.kind === "income" ? (
                    <Heart aria-hidden="true" className="size-4" />
                  ) : (
                    <CircleDollarSign aria-hidden="true" className="size-4" />
                  )}
                </IconBubble>
                <div className={recentMovementsCardDashboardPage.text}>
                  <span className={recentMovementsCardDashboardPage.name}>{movement.concept}</span>
                  <span className={recentMovementsCardDashboardPage.note}>{movement.note}</span>
                </div>
              </div>
              <div className={recentMovementsCardDashboardPage.kind}>
                <StatusPill tone={kind.pill}>{kind.label}</StatusPill>
              </div>
              <b className={cn(recentMovementsCardDashboardPage.amount, kind.amount)}>
                {movement.amount}
              </b>
            </div>
          );
        })}
      </div>
    </BoardCard>
  );
}
