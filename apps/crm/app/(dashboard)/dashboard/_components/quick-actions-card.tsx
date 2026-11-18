import { CalendarPlus, FilePlus2, HandCoins, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
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

export function QuickActionsCard() {
  return (
    <DashboardCard className="mb-7">
      <DashboardCardHeader subtitle="Lo que más se usa en tesorería" title="Accesos rápidos" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              className="flex flex-col gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4 text-left transition hover:-translate-y-0.5 hover:border-foreground"
              href={action.href}
              key={action.title}
            >
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{action.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
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
