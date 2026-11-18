import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { PendingApproval } from "../data/summary";

const pendingApprovalsCardDashboardPage = {
  header: cn("mb-3.5 flex items-center gap-2"),
  title: cn("font-display text-[22px] font-medium tracking-tight whitespace-nowrap"),
  count: cn("underline decoration-[1.5px] underline-offset-[5px]"),
  spacer: cn("flex-1"),
  list: cn("flex flex-col gap-2"),
  item: cn("flex items-center gap-3 rounded-[20px] bg-white/70 p-3"),
  avatar: cn("size-9 text-[13px] font-extrabold shadow-[0_0_0_2px_#fff]"),
  text: cn("flex min-w-0 flex-1 flex-col leading-snug"),
  name: cn("truncate text-[13.5px]"),
  owner: cn("truncate text-xs text-[var(--tinta-apagada)]"),
  amount: cn("text-[13.5px] tabular-nums"),
};

interface PendingApprovalsCardProps {
  approvals: PendingApproval[];
}

export function PendingApprovalsCard({ approvals }: PendingApprovalsCardProps) {
  return (
    <BoardCard surface="gold">
      <div className={pendingApprovalsCardDashboardPage.header}>
        <h2 className={pendingApprovalsCardDashboardPage.title}>
          Por aprobar{" "}
          <span className={pendingApprovalsCardDashboardPage.count}>{approvals.length}</span>
        </h2>
        <span className={pendingApprovalsCardDashboardPage.spacer} />
        <BoardButton href={getChurchRoutePath("requests")} size="sm" variant="dark">
          Revisar
        </BoardButton>
      </div>
      <ul className={pendingApprovalsCardDashboardPage.list}>
        {approvals.map((approval) => (
          <li className={pendingApprovalsCardDashboardPage.item} key={approval.id}>
            <IconBubble className={pendingApprovalsCardDashboardPage.avatar} tone={approval.tone}>
              {approval.initials}
            </IconBubble>
            <div className={pendingApprovalsCardDashboardPage.text}>
              <b className={pendingApprovalsCardDashboardPage.name}>{approval.title}</b>
              <span className={pendingApprovalsCardDashboardPage.owner}>{approval.owner}</span>
            </div>
            <b className={pendingApprovalsCardDashboardPage.amount}>{approval.amount}</b>
          </li>
        ))}
      </ul>
    </BoardCard>
  );
}
