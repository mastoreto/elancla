import { Sparkles } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";

const treasuryNotesCardDashboardPage = {
  header: cn("mb-3 flex items-center gap-3"),
  title: cn("font-display text-[19px] font-medium text-white"),
  body: cn("text-[13.5px] leading-relaxed text-white/75"),
};

interface TreasuryNotesCardProps {
  note: string;
}

export function TreasuryNotesCard({ note }: TreasuryNotesCardProps) {
  return (
    <BoardCard surface="ink">
      <div className={treasuryNotesCardDashboardPage.header}>
        <IconBubble className="size-[38px]" tone="gold">
          <Sparkles aria-hidden="true" className="size-4" />
        </IconBubble>
        <h2 className={treasuryNotesCardDashboardPage.title}>Notas de tesorería</h2>
      </div>
      <p className={treasuryNotesCardDashboardPage.body}>{note}</p>
    </BoardCard>
  );
}
