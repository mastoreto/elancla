import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReportSectionShell } from "./report-section-shell";

const reportExportActionsReportsPage = {
  container: cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between"),
};

interface ReportExportActionsProps {
  disabled?: boolean;
}

export function ReportExportActions({ disabled = true }: ReportExportActionsProps) {
  return (
    <ReportSectionShell
      title="Exportar resultados"
      description="Acciones de salida preparadas para conectarse con la capa de generación."
    >
      <div className={reportExportActionsReportsPage.container}>
        <p className="text-sm text-muted-foreground">
          Las exportaciones se habilitan cuando haya resultados disponibles.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" disabled={disabled}>
            <Download className="size-4" />
            Descargar PDF
          </Button>
          <Button type="button" disabled={disabled}>
            <FileSpreadsheet className="size-4" />
            Exportar CSV
          </Button>
        </div>
      </div>
    </ReportSectionShell>
  );
}
