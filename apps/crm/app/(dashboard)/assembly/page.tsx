import { CalendarClock, DoorOpen, Plus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardMetricStrip,
  DashboardPageHeader,
} from "@/src/componentes/dashboard";
import { AssemblyTable } from "./components/assembly-table";
import { assemblyReports } from "./data/assembly-reports";

const assemblyPage = {
  action: cn("rounded-full"),
};

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function AssemblyPage() {
  const open = assemblyReports.filter((report) => report.status === "Abierto").length;
  const scheduled = assemblyReports.filter((report) => report.status === "Programado").length;
  const accesses = assemblyReports.reduce((total, report) => total + report.accesses, 0);

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button className={assemblyPage.action} type="button">
            <Plus aria-hidden="true" />
            Publicar informe
          </Button>
        }
        description="Comparte informes completos con los asistentes mediante un código, solo durante la sesión y en el lugar."
        emphasis="con transparencia"
        kicker="Gobierno"
        title="Asamblea"
      />

      <DashboardMetricStrip
        metrics={[
          {
            label: "Abiertas ahora",
            value: String(open),
            detail: "Asamblea ordinaria en curso",
            icon: DoorOpen,
            accent: true,
          },
          {
            label: "Programadas",
            value: String(scheduled),
            detail: "Próximas asambleas",
            icon: CalendarClock,
          },
          {
            label: "Accesos",
            value: String(accesses),
            detail: "Entre todos los informes",
            icon: ShieldAlert,
            tone: "up",
          },
        ]}
      />

      <DashboardCard>
        <DashboardCardHeader
          subtitle={`${assemblyReports.length} informes`}
          title="Informes de asamblea"
        />
        <AssemblyTable reports={assemblyReports} />
      </DashboardCard>
    </>
  );
}
