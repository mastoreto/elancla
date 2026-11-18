import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { AssemblyReport } from "../types";
import { AccessQr } from "./access-qr";

interface AssemblyProjectionProps {
  report: AssemblyReport;
}

const assemblyProjectionAssemblyPage = {
  stage: cn("flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center"),
  title: cn("font-display text-4xl font-medium text-balance"),
  hint: cn("max-w-xl text-lg text-muted-foreground"),
  qr: cn("w-full max-w-md"),
  code: cn("font-mono text-3xl font-semibold tracking-[0.2em]"),
};

export function AssemblyProjection({ report }: AssemblyProjectionProps) {
  return (
    <div className={assemblyProjectionAssemblyPage.stage}>
      <h1 className={assemblyProjectionAssemblyPage.title}>{report.title}</h1>
      <p className={assemblyProjectionAssemblyPage.hint}>
        Escanea el código o ingresa el código de acceso. Solo disponible en {report.place} durante
        la sesión.
      </p>
      <AccessQr className={assemblyProjectionAssemblyPage.qr} code={report.accessCode} />
      <p className={assemblyProjectionAssemblyPage.code}>{report.accessCode}</p>
      <Button asChild={true} variant="ghost">
        <Link href={getChurchRoutePath("assembly", report.id)}>
          <ArrowLeft aria-hidden="true" />
          Volver al panel
        </Link>
      </Button>
    </div>
  );
}
