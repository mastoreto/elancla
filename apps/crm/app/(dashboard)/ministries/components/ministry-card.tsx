import { Globe, PencilLine } from "lucide-react";
import Link from "next/link";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { MinistrySummary } from "../types";
import {
  formatMoney,
  getExecutionPercent,
  getExecutionTone,
  getLeaderInitials,
  getMinistryAppearance,
} from "../utils";

interface MinistryCardProps {
  ministry: MinistrySummary;
}

const ministryCardMinistriesPage = {
  card: cn("relative flex flex-col p-[22px]"),
  header: cn("flex items-start gap-3"),
  bubble: cn("size-12"),
  bubbleIcon: cn("size-5"),
  heading: cn("flex min-w-0 flex-1 flex-col gap-[3px]"),
  name: cn("font-display text-[21px] leading-tight font-medium after:absolute after:inset-0"),
  volunteers: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  edit: cn("relative z-10"),
  editIcon: cn("size-4"),
  tags: cn("mt-3 flex flex-wrap gap-1.5"),
  visible: cn(
    "inline-flex items-center gap-1.5 rounded-full bg-[var(--vida-50)] px-2.5 py-[3px] text-[11.5px] font-bold text-[var(--vida)]",
  ),
  visibleIcon: cn("size-3"),
  category: cn(
    "rounded-full bg-secondary px-2.5 py-[3px] text-[11.5px] font-bold text-[var(--tinta-suave)]",
  ),
  description: cn("my-3.5 text-[13.5px] leading-[1.6] text-[var(--tinta-suave)]"),
  leader: cn("mb-3.5 flex items-center gap-2.5"),
  avatar: cn("size-[30px] text-[11px] font-extrabold shadow-[0_0_0_2px_#fff]"),
  leaderText: cn("flex flex-col leading-[1.3]"),
  leaderLabel: cn("text-[11.5px] text-[var(--tinta-apagada)]"),
  leaderName: cn("text-[13.5px] font-bold"),
  budget: cn("mt-auto flex flex-col gap-1.5"),
  budgetRow: cn("flex justify-between text-[12.5px] text-[var(--tinta-apagada)] tabular-nums"),
  executed: cn("text-foreground"),
  percentGold: cn("font-bold text-[var(--oro-texto)]"),
  percentGreen: cn("font-bold text-[var(--vida)]"),
};

export function MinistryCard({ ministry }: MinistryCardProps) {
  const percent = getExecutionPercent(ministry);
  const tone = getExecutionTone(percent);
  const { icon: Icon, tone: bubbleTone } = getMinistryAppearance(ministry.id);
  const detailHref = getChurchRoutePath("ministries", ministry.id);

  return (
    <BoardCard className={ministryCardMinistriesPage.card}>
      <div className={ministryCardMinistriesPage.header}>
        <IconBubble className={ministryCardMinistriesPage.bubble} tone={bubbleTone}>
          <Icon aria-hidden="true" className={ministryCardMinistriesPage.bubbleIcon} />
        </IconBubble>
        <div className={ministryCardMinistriesPage.heading}>
          <Link className={ministryCardMinistriesPage.name} href={detailHref}>
            {ministry.name}
          </Link>
          <span className={ministryCardMinistriesPage.volunteers}>
            {ministry.volunteers} voluntarios
          </span>
        </div>
        <RowIconButton
          className={ministryCardMinistriesPage.edit}
          href={`${detailHref}/edit`}
          label={`Editar ${ministry.name}`}
        >
          <PencilLine aria-hidden="true" className={ministryCardMinistriesPage.editIcon} />
        </RowIconButton>
      </div>
      <div className={ministryCardMinistriesPage.tags}>
        {ministry.visibleOnSite ? (
          <span className={ministryCardMinistriesPage.visible}>
            <Globe aria-hidden="true" className={ministryCardMinistriesPage.visibleIcon} />
            Visible en el sitio
          </span>
        ) : null}
        <span className={ministryCardMinistriesPage.category}>{ministry.category}</span>
      </div>
      <p className={ministryCardMinistriesPage.description}>{ministry.description}</p>
      <div className={ministryCardMinistriesPage.leader}>
        <IconBubble className={ministryCardMinistriesPage.avatar} tone={bubbleTone}>
          {getLeaderInitials(ministry.leaderName)}
        </IconBubble>
        <div className={ministryCardMinistriesPage.leaderText}>
          <span className={ministryCardMinistriesPage.leaderLabel}>Líder</span>
          <b className={ministryCardMinistriesPage.leaderName}>{ministry.leaderName}</b>
        </div>
      </div>
      <div className={ministryCardMinistriesPage.budget}>
        <div className={ministryCardMinistriesPage.budgetRow}>
          <span>
            <b className={ministryCardMinistriesPage.executed}>
              {formatMoney(ministry.currency, ministry.executed)}
            </b>{" "}
            de {formatMoney(ministry.currency, ministry.budget)}
          </span>
          <b
            className={
              tone === "green"
                ? ministryCardMinistriesPage.percentGreen
                : ministryCardMinistriesPage.percentGold
            }
          >
            {percent} %
          </b>
        </div>
        <ProgressBar
          label={`Presupuesto ejecutado de ${ministry.name}`}
          tone={tone}
          value={percent}
        />
      </div>
    </BoardCard>
  );
}
