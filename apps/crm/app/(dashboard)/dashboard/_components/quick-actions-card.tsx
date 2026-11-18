import { CalendarPlus, FilePlus2, HandCoins, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";

const quickActions = [
  {
    title: "Nuevo movimiento",
    description: "Registrar ingreso o gasto",
    href: getChurchRoutePath("movements"),
    icon: PlusCircle,
  },
  {
    title: "Nueva solicitud",
    description: "Enviar pedido de fondos",
    href: getChurchRoutePath("requests"),
    icon: HandCoins,
  },
  {
    title: "Cargar comprobante",
    description: "Adjuntar respaldo financiero",
    href: getChurchRoutePath("vouchers"),
    icon: FilePlus2,
  },
  {
    title: "Crear presupuesto",
    description: "Planificar un nuevo periodo",
    href: getChurchRoutePath("budgets"),
    icon: CalendarPlus,
  },
];

const quickActionsCardDashboardPage = {
  container: cn("mb-7"),
  grid: cn("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"),
  action: cn("flex flex-col gap-3 rounded-[14px] border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-foreground"),
  icon: cn("flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary"),
  iconGlyph: cn("size-4"),
  title: cn("block text-sm font-semibold text-foreground"),
  description: cn("mt-1 block text-xs text-muted-foreground"),
};

export function QuickActionsCard() {
  return (
    <DashboardCard className={quickActionsCardDashboardPage.container}>
      <DashboardCardHeader subtitle="Lo que más se usa en tesorería" title="Accesos rápidos" />
      <div className={quickActionsCardDashboardPage.grid}>
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              className={quickActionsCardDashboardPage.action}
              href={action.href}
              key={action.title}
            >
              <span className={quickActionsCardDashboardPage.icon}>
                <Icon className={quickActionsCardDashboardPage.iconGlyph} />
              </span>
              <span>
                <span className={quickActionsCardDashboardPage.title}>{action.title}</span>
                <span className={quickActionsCardDashboardPage.description}>
                  {action.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}
