import { Download, Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { balances, currentUser, moneyRequests, movements, projects } from "@/lib/data";
import {
  type DashboardMetric,
  DashboardMetricStrip,
  DashboardPageHeader,
} from "@/src/componentes/dashboard";
import { formatCompactCurrency, formatCurrency } from "./dashboard-formatters";
import { PendingRequestsCard } from "./pending-requests-card";
import { ProjectBudgetCard } from "./project-budget-card";
import { QuickActionsCard } from "./quick-actions-card";
import { RecentFinancialMovementsCard } from "./recent-financial-movements-card";
import { TreasuryNotesCard } from "./treasury-notes-card";
import { type WeeklyOffering, WeeklyOfferingsChart } from "./weekly-offerings-chart";

const dashboardOverviewDashboardPage = {
  exportButton: cn("bg-background"),
  buttonIcon: cn("size-3.5"),
  chartSection: cn("mb-7"),
  columns: cn("mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"),
  sidebarColumn: cn("flex flex-col gap-6"),
  metrics: cn("xl:grid-cols-3"),
};

const sparkPaths = {
  cash: "M2 22 L12 18 L22 20 L32 14 L42 16 L52 10 L62 12 L72 4 L78 6",
  bank: "M2 20 L14 18 L26 16 L38 17 L50 12 L62 14 L74 8 L78 10",
  income: "M2 24 L14 22 L26 18 L38 20 L50 14 L62 12 L74 8 L78 6",
  expense: "M2 18 L12 14 L22 20 L32 12 L42 16 L52 8 L62 14 L72 6 L78 10",
};

// Seed series from the "crm-s-resumen" board until weekly totals come from the API.
const weeklyOfferings: WeeklyOffering[] = [
  { week: "13 oct", received: 14_200, goal: 18_000 },
  { week: "20 oct", received: 17_800, goal: 18_000 },
  { week: "27 oct", received: 15_600, goal: 18_000 },
  { week: "3 nov", received: 21_400, goal: 18_000 },
  { week: "10 nov", received: 19_900, goal: 18_000 },
  { week: "17 nov", received: 24_300, goal: 18_000 },
  { week: "24 nov", received: 22_100, goal: 18_000 },
];

function getFirstName(fullName: string) {
  return fullName.split(" ")[0] ?? fullName;
}

function createDashboardMetrics(): DashboardMetric[] {
  const totalUyu = balances.cashUYU + balances.bankUYU;

  return [
    {
      accent: true,
      label: "Saldo total",
      value: formatCompactCurrency(totalUyu, "UYU"),
      detail: `+ ${formatCurrency(balances.cashUSD + balances.bankUSD, "USD")} en dólares`,
      tone: "neutral",
      icon: WalletCards,
      sparkPath: sparkPaths.cash,
    },
    {
      label: "Ofrendas del mes",
      value: formatCompactCurrency(balances.monthlyIncomeUYU, "UYU"),
      detail: "+12% vs. mes anterior",
      tone: "up",
      icon: TrendingUp,
      sparkPath: sparkPaths.income,
    },
    {
      label: "Egresos del mes",
      value: formatCompactCurrency(balances.monthlyExpenseUYU, "UYU"),
      detail: "+6% vs. mes anterior",
      tone: "down",
      icon: TrendingDown,
      sparkPath: sparkPaths.expense,
    },
  ];
}

export function DashboardOverview() {
  const pendingCount = moneyRequests.filter((request) => request.status === "pending").length;

  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <Button asChild={true} className={dashboardOverviewDashboardPage.exportButton} variant="outline">
              <Link href={getChurchRoutePath("reports")}>
                <Download className={dashboardOverviewDashboardPage.buttonIcon} />
                Exportar
              </Link>
            </Button>
            <Button asChild={true}>
              <Link href={getChurchRoutePath("movements")}>
                <Plus className={dashboardOverviewDashboardPage.buttonIcon} />
                Nuevo movimiento
              </Link>
            </Button>
          </>
        }
        description={`Así va la mayordomía de la iglesia este mes. Hay ${pendingCount} solicitudes por aprobar.`}
        emphasis={`${getFirstName(currentUser.name)}.`}
        kicker="Tesorería"
        title="Buenos días,"
      />

      <DashboardMetricStrip className={dashboardOverviewDashboardPage.metrics} metrics={createDashboardMetrics()} />

      <div className={dashboardOverviewDashboardPage.chartSection}>
        <WeeklyOfferingsChart data={weeklyOfferings} />
      </div>

      <div className={dashboardOverviewDashboardPage.columns}>
        <RecentFinancialMovementsCard movements={movements.slice(0, 8)} />
        <div className={dashboardOverviewDashboardPage.sidebarColumn}>
          <PendingRequestsCard requests={moneyRequests} />
          <ProjectBudgetCard projects={projects} />
        </div>
      </div>

      <QuickActionsCard />
      <TreasuryNotesCard />
    </>
  );
}
