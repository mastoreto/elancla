import { churchConfig } from "@/lib/church";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  BalanceCards,
  PendingApprovalsCard,
  ProjectBudgetsCard,
  QuickActionsCard,
  RecentMovementsCard,
  SummaryHeader,
  TreasuryNotesCard,
} from "./components";
import {
  balanceCards,
  pendingApprovals,
  projectBudgets,
  recentMovements,
  treasuryNote,
} from "./data/summary";
import { formatLongDate, getGreeting } from "./utils";

const dashboardPage = {
  stack: cn("flex flex-col gap-5"),
  columns: cn("grid items-start gap-[18px] xl:grid-cols-[1.55fr_1fr]"),
  aside: cn("flex flex-col gap-[18px]"),
};

export default function DashboardPage() {
  const now = new Date();
  const firstName = currentUser.name.split(" ")[0] ?? currentUser.name;

  return (
    <div className={dashboardPage.stack}>
      <SummaryHeader
        churchName={churchConfig.name}
        dateLabel={formatLongDate(now)}
        firstName={firstName}
        greeting={getGreeting(now.getHours())}
      />
      <BalanceCards cards={balanceCards} />
      <div className={dashboardPage.columns}>
        <RecentMovementsCard movements={recentMovements} />
        <aside className={dashboardPage.aside}>
          <PendingApprovalsCard approvals={pendingApprovals} />
          <ProjectBudgetsCard budgets={projectBudgets} />
          <QuickActionsCard />
          <TreasuryNotesCard note={treasuryNote} />
        </aside>
      </div>
    </div>
  );
}
