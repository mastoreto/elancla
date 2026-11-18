import { FileWarning, ShieldCheck, Workflow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const voucherGuidancePanelVouchersPage = {
  icon: cn("mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"),
};

const guidanceItems = [
  {
    title: "Uso excepcional",
    description:
      "Utiliza comprobantes cuando no exista una boleta disponible para respaldar el gasto.",
    icon: FileWarning,
  },
  {
    title: "Justificación clara",
    description:
      "Deja preparada la información para flujos de justificación obligatoria, revisión y trazabilidad.",
    icon: ShieldCheck,
  },
  {
    title: "Vinculación futura",
    description:
      "Mantén visible la relación con movimientos y solicitudes para futuras integraciones del módulo.",
    icon: Workflow,
  },
];

export function VoucherGuidancePanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Contexto del comprobante</CardTitle>
        <CardDescription>
          Esta interfaz está preparada para crecer con reglas de control y trazabilidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {guidanceItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-lg border bg-muted/20 p-4">
              <div className={voucherGuidancePanelVouchersPage.icon}>
                <Icon className="size-5" />
              </div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
