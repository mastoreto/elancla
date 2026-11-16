import { Building2, Download, Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
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

const sparkPaths = {
  cash: "M2 22 L12 18 L22 20 L32 14 L42 16 L52 10 L62 12 L72 4 L78 6",
  bank: "M2 20 L14 18 L26 16 L38 17 L50 12 L62 14 L74 8 L78 10",
  income: "M2 24 L14 22 L26 18 L38 20 L50 14 L62 12 L74 8 L78 6",
  expense: "M2 18 L12 14 L22 20 L32 12 L42 16 L52 8 L62 14 L72 6 L78 10",
};

function getFirstName(fullName: string) {
  return fullName.split(" ")[0] ?? fullName;
}

function createDashboardMetrics(): DashboardMetric[] {
  const totalUyu = balances.cashUYU + balances.bankUYU;
  const netUyu = balances.monthlyIncomeUYU - balances.monthlyExpenseUYU;

  return [
    {
      label: "Caja · efectivo",
      value: formatCompactCurrency(balances.cashUYU, "UYU"),
      detail: `+ ${formatCurrency(balances.cashUSD, "USD")} disponibles`,
      tone: "neutral",
      icon: WalletCards,
      sparkPath: sparkPaths.cash,
    },
    {
      label: "Banco · cuentas",
      value: formatCompactCurrency(balances.bankUYU, "UYU"),
      detail: `+ ${formatCurrency(balances.bankUSD, "USD")} en USD`,
      tone: "neutral",
      icon: Building2,
      sparkPath: sparkPaths.bank,
    },
    {
      label: "Ingresos · mes",
      value: formatCompactCurrency(balances.monthlyIncomeUYU, "UYU"),
      detail: "+12% vs. periodo anterior",
      tone: "up",
      icon: TrendingUp,
      sparkPath: sparkPaths.income,
    },
    {
      accent: true,
      label: "Flujo neto",
      value: formatCompactCurrency(netUyu, "UYU"),
      detail: `${formatCompactCurrency(totalUyu, "UYU")} de saldo total`,
      tone: "neutral",
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
            <Button asChild={true} className="bg-background" variant="outline">
              <Link href={getChurchRoutePath("reports")}>
                <Download className="size-3.5" />
                Exportar
              </Link>
            </Button>
            <Button asChild={true}>
              <Link href={getChurchRoutePath("movements")}>
                <Plus className="size-3.5" />
                Nuevo movimiento
              </Link>
            </Button>
          </>
        }
        description={
          <>
            <span className="block">Resumen financiero de tesorería.</span>
            <span className="block">Hay {pendingCount} solicitudes pendientes.</span>
            <span className="block">Modo interfaz con datos locales.</span>
          </>
        }
        emphasis={`${getFirstName(currentUser.name)}.`}
        kicker="[ 01 - Panel ]"
        title="Buenos días,"
      />

      <DashboardMetricStrip metrics={createDashboardMetrics()} />

      <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <RecentFinancialMovementsCard movements={movements.slice(0, 8)} />
        <div className="flex flex-col gap-6">
          <PendingRequestsCard requests={moneyRequests} />
          <ProjectBudgetCard projects={projects} />
        </div>
      </div>

      <QuickActionsCard />
      <TreasuryNotesCard />
    </>
  );
}
