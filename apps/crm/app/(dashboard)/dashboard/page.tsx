import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { churchConfig } from "@/lib/church";
import { cn } from "@/lib/utils";
import {
  BalanceCards,
  PendingApprovalsCard,
  PendingCalendarCard,
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
import { loadPendingCalendar } from "./lib/loadPendingCalendar";
import { formatLongDate, getGreeting } from "./utils";

const dashboardPage = {
  stack: cn("flex flex-col gap-5"),
  columns: cn("grid items-start gap-[18px] xl:grid-cols-[1.55fr_1fr]"),
  aside: cn("flex flex-col gap-[18px]"),
};

async function getFirstName(): Promise<string | null> {
  const api = await createServerApiClient();
  const response = await api.me.$get();
  if (!response.ok) {
    return null;
  }
  const { name } = await response.json();
  return name.split(" ")[0] || null;
}

export default async function DashboardPage() {
  const now = new Date();
  const [firstName, pendingCalendar] = await Promise.all([getFirstName(), loadPendingCalendar()]);

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
          <PendingCalendarCard pending={pendingCalendar} />
          <PendingApprovalsCard approvals={pendingApprovals} />
          <ProjectBudgetsCard budgets={projectBudgets} />
          <QuickActionsCard />
          <TreasuryNotesCard note={treasuryNote} />
        </aside>
      </div>
    </div>
  );
}
