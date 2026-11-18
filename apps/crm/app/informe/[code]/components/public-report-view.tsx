import { MapPin } from "lucide-react";
import type { AssemblyReport } from "@/app/(dashboard)/assembly/types";
import { cn } from "@/lib/utils";

const REPORT_SECTIONS = [
  { title: "Resumen financiero", detail: "Ingresos y egresos del período, saldo y variación." },
  { title: "Presupuesto por ministerio", detail: "Ejecución frente a lo aprobado." },
  { title: "Proyectos en curso", detail: "Avance y fondos asignados." },
] as const;

const publicReportViewInformePage = {
  stack: cn("space-y-6"),
  kicker: cn("text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"),
  title: cn("font-display text-3xl font-medium text-balance"),
  place: cn("flex items-center gap-1.5 text-sm text-muted-foreground"),
  list: cn("space-y-3"),
  section: cn("rounded-xl border bg-card p-5 shadow-card"),
  sectionTitle: cn("font-display text-lg font-medium"),
  sectionDetail: cn("mt-1 text-sm text-muted-foreground"),
};

interface PublicReportViewProps {
  report: AssemblyReport;
}

export function PublicReportView({ report }: PublicReportViewProps) {
  return (
    <div className={publicReportViewInformePage.stack}>
      <header>
        <p className={publicReportViewInformePage.kicker}>{report.assembly}</p>
        <h1 className={publicReportViewInformePage.title}>{report.title}</h1>
        <p className={publicReportViewInformePage.place}>
          <MapPin aria-hidden="true" className="size-4" />
          {report.place} · {report.validity}
        </p>
      </header>
      <ul className={publicReportViewInformePage.list}>
        {REPORT_SECTIONS.map((section) => (
          <li className={publicReportViewInformePage.section} key={section.title}>
            <h2 className={publicReportViewInformePage.sectionTitle}>{section.title}</h2>
            <p className={publicReportViewInformePage.sectionDetail}>{section.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
