import type { Voucher } from "@/app/(dashboard)/vouchers/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VoucherDetailProps {
  voucher: Voucher;
}

function formatCurrency(currency: Voucher["currency"], amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function VoucherDetail({ voucher }: VoucherDetailProps) {
  const detailItems = [
    { label: "Descripción", value: voucher.description },
    {
      label: "Justificación",
      value: voucher.justification || "Sin justificación registrada",
      fullWidth: true,
    },
    { label: "Monto", value: formatCurrency(voucher.currency, voucher.amount), emphasis: true },
    { label: "Fecha", value: formatDate(voucher.date) },
    { label: "Responsable", value: voucher.responsible },
    { label: "Relacionado a", value: voucher.relatedEntity, fullWidth: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle del comprobante</CardTitle>
        <CardDescription>
          Revisa la información registrada antes de integrarla a controles, auditoría y flujos
          obligatorios de justificación.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {detailItems.map((item) => (
          <div
            key={item.label}
            className={[
              "space-y-1 rounded-lg border bg-muted/20 p-4",
              item.fullWidth ? "md:col-span-2" : "",
            ].join(" ")}
          >
            <p className="text-muted-foreground text-xs uppercase tracking-wide">{item.label}</p>
            <p
              className={[
                "text-foreground whitespace-pre-wrap font-medium",
                item.emphasis ? "text-lg" : "",
              ].join(" ")}
            >
              {item.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
