import { Projector } from "lucide-react";
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
import type { AssemblyReport } from "../types";
import { AccessQr } from "./access-qr";
import { AssemblyControls } from "./assembly-controls";

interface AssemblyDetailContentProps {
  report: AssemblyReport;
}

const assemblyDetailContentAssemblyPage = {
  layout: cn("grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"),
  facts: cn("grid gap-4 sm:grid-cols-2"),
  factLabel: cn("text-xs text-muted-foreground"),
  factValue: cn("mt-1 text-sm font-medium"),
  code: cn("font-mono text-lg font-semibold tracking-wider"),
  qrCard: cn("flex flex-col items-center gap-4"),
  qr: cn("max-w-56"),
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={assemblyDetailContentAssemblyPage.factLabel}>{label}</dt>
      <dd className={assemblyDetailContentAssemblyPage.factValue}>{value}</dd>
    </div>
  );
}

export function AssemblyDetailContent({ report }: AssemblyDetailContentProps) {
  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <AssemblyControls initialStatus={report.status} reportTitle={report.title} />
            <Button asChild={true} variant="outline">
              <Link href={getChurchRoutePath("assembly", report.id, "projection")}>
                <Projector aria-hidden="true" />
                Proyectar QR
              </Link>
            </Button>
          </>
        }
        description={report.assembly}
        kicker="Asamblea"
        title={report.title}
      />

      <DashboardMetricStrip
        metrics={[
          { label: "Accesos", value: String(report.accesses), detail: "Asistentes que abrieron" },
        ]}
      />

      <div className={assemblyDetailContentAssemblyPage.layout}>
        <DashboardCard>
          <DashboardCardHeader subtitle="Quién y cuándo puede verlo" title="Acceso" />
          <dl className={assemblyDetailContentAssemblyPage.facts}>
            <div>
              <dt className={assemblyDetailContentAssemblyPage.factLabel}>Código</dt>
              <dd className={assemblyDetailContentAssemblyPage.code}>{report.accessCode}</dd>
            </div>
            <Fact label="Vigencia" value={report.validity} />
            <Fact label="Lugar" value={report.place} />
            <Fact label="Enlace público" value={`/informe/${report.accessCode}`} />
          </dl>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader subtitle="Para mostrar en la sala" title="Código QR" />
          <div className={assemblyDetailContentAssemblyPage.qrCard}>
            <AccessQr className={assemblyDetailContentAssemblyPage.qr} code={report.accessCode} />
          </div>
        </DashboardCard>
      </div>
    </>
  );
}
