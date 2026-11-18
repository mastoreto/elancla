import { ClipboardList, Rocket, Wallet } from "lucide-react";
import { DashboardMetricStrip } from "@/components/dashboard";
import type { ProjectStats } from "../types";

interface ProjectsStatsProps {
  stats: ProjectStats;
}

function formatBudget(amount: number, currency: "UYU" | "USD"): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectsStats({ stats }: ProjectsStatsProps) {
  return (
    <DashboardMetricStrip
      metrics={[
        {
          accent: true,
          label: "Proyectos activos",
          value: String(stats.active),
          detail: "En progreso ahora",
          icon: Rocket,
        },
        {
          label: "En planificación",
          value: String(stats.planning),
          detail: "Aún sin ejecución",
          icon: ClipboardList,
        },
        {
          label: "Presupuesto total UYU",
          value: formatBudget(stats.totalBudgetUYU, "UYU"),
          detail: "Suma de proyectos en pesos",
          icon: Wallet,
        },
        {
          label: "Presupuesto total USD",
          value: formatBudget(stats.totalBudgetUSD, "USD"),
          detail: "Suma de proyectos en dólares",
          icon: Wallet,
        },
      ]}
    />
  );
}
