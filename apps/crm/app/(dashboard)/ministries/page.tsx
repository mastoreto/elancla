import { HeartHandshake, Plus, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardMetricStrip,
  DashboardPageHeader,
} from "@/src/componentes/dashboard";
import { MinistryCard } from "./components/ministry-card";
import { ministries } from "./data/ministries";

const PERCENT = 100;

const ministriesPage = {
  action: cn("rounded-full"),
  grid: cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3"),
  cardLink: cn("block rounded-xl transition hover:-translate-y-0.5"),
};

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function MinistriesPage() {
  const volunteers = ministries.reduce((total, ministry) => total + ministry.volunteers, 0);
  const executed = ministries.reduce((total, ministry) => total + ministry.executed, 0);
  const budget = ministries.reduce((total, ministry) => total + ministry.budget, 0);
  const executedPercent = budget > 0 ? Math.round((executed / budget) * PERCENT) : 0;

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button asChild={true} className={ministriesPage.action}>
            <Link href={getChurchRoutePath("ministries", "new")}>
              <Plus aria-hidden="true" />
              Nuevo ministerio
            </Link>
          </Button>
        }
        description="Contenido del sitio web: cada ministerio con su descripción, líder y horarios. El presupuesto se gestiona aparte."
        emphasis="en servicio"
        kicker="Contenido"
        title="Ministerios"
      />

      <DashboardMetricStrip
        metrics={[
          {
            label: "Ministerios activos",
            value: String(ministries.length),
            detail: "Cada uno con líder asignado",
            icon: HeartHandshake,
            accent: true,
          },
          {
            label: "Voluntarios",
            value: String(volunteers),
            detail: "Personas sirviendo",
            icon: Users,
            tone: "up",
          },
          {
            label: "Ejecutado",
            value: `${executedPercent} %`,
            detail: "Del presupuesto total",
            icon: Wallet,
          },
        ]}
      />

      <DashboardCard>
        <DashboardCardHeader
          subtitle={`${ministries.length} ministerios`}
          title="Todos los ministerios"
        />
        <div className={ministriesPage.grid}>
          {ministries.map((ministry) => (
            <Link
              className={ministriesPage.cardLink}
              href={getChurchRoutePath("ministries", ministry.id)}
              key={ministry.id}
            >
              <MinistryCard ministry={ministry} />
            </Link>
          ))}
        </div>
      </DashboardCard>
    </>
  );
}
