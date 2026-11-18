import type { Receipt } from "@/app/(dashboard)/receipts/types/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const receiptDetailsPanelReceiptsPage = {
  item: cn("space-y-1 rounded-lg border bg-muted/20 p-4"),
  itemLabel: cn("text-muted-foreground text-xs uppercase tracking-wide"),
};

interface ReceiptDetailsPanelProps {
  receipt: Receipt;
}

function formatCurrency(currency: Receipt["currency"], amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ReceiptDetailsPanel({ receipt }: ReceiptDetailsPanelProps) {
  const detailItems = [
    { label: "Número de boleta", value: receipt.number },
    { label: "Proveedor", value: receipt.provider },
    { label: "Monto", value: formatCurrency(receipt.currency, receipt.amount) },
    { label: "Moneda", value: receipt.currency },
    { label: "Fecha", value: formatDate(receipt.date) },
    { label: "Relacionado a", value: receipt.relatedEntity },
    { label: "Archivo", value: receipt.fileUrl ? "Adjunto disponible" : "Sin archivo" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Detalle de boleta</CardTitle>
        <CardDescription>
          Revisa la información visible antes de integrarla a flujos de auditoría financiera.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {detailItems.map((item) => (
          <div key={item.label} className={receiptDetailsPanelReceiptsPage.item}>
            <p className={receiptDetailsPanelReceiptsPage.itemLabel}>{item.label}</p>
            <p className="font-medium text-foreground">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
