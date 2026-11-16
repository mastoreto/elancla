import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { ReportCurrency, ReportSummary } from "../types/index";
import { ReportDataState } from "./report-data-state";

interface ReportSummaryCardsProps {
  summary: ReportSummary | null;
  currency?: ReportCurrency;
  isLoading?: boolean;
  isEmpty?: boolean;
  errorMessage?: string | null;
}

const loadingCardIds = ["summary-a", "summary-b", "summary-c", "summary-d"] as const;

function formatCurrency(amount: number, currency: ReportCurrency) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatQuantity(amount: number) {
  return new Intl.NumberFormat("es-UY").format(amount);
}

export function ReportSummaryCards({
  summary,
  currency = "UYU",
  isLoading = false,
  isEmpty = false,
  errorMessage,
}: ReportSummaryCardsProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loadingCardIds.map((cardId) => (
            <Card key={cardId} className="border-border/60">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="size-10 rounded-xl" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Resumen general</h2>
            <p className="text-sm text-muted-foreground">
              Totales consolidados para el período seleccionado.
            </p>
          </div>
        </div>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <ReportDataState
              variant="error"
              title="Ocurrió un error al mostrar los datos"
              description={errorMessage}
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isEmpty || !summary) {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Resumen general</h2>
            <p className="text-sm text-muted-foreground">
              Totales consolidados para el período seleccionado.
            </p>
          </div>
        </div>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <ReportDataState
              variant="empty"
              title="Sin métricas disponibles"
              description="No hay datos para los filtros seleccionados"
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  const items = [
    {
      label: "Ingresos totales",
      value: formatCurrency(summary.totalIncome, currency),
      icon: ArrowDownCircle,
      chipClassName: "bg-income/10 text-income",
      valueClassName: "text-income",
      description: "Ingresos acumulados en el período",
    },
    {
      label: "Egresos totales",
      value: formatCurrency(summary.totalExpenses, currency),
      icon: ArrowUpCircle,
      chipClassName: "bg-expense/10 text-expense",
      valueClassName: "text-expense",
      description: "Egresos registrados en el período",
    },
    {
      label: "Balance",
      value: formatCurrency(summary.balance, currency),
      icon: CircleDollarSign,
      chipClassName: "bg-accent/10 text-accent",
      valueClassName: summary.balance >= 0 ? "text-foreground" : "text-expense",
      description: "Resultado neto del período",
    },
    {
      label: "Cantidad de movimientos",
      value: formatQuantity(summary.movementCount),
      icon: ReceiptText,
      chipClassName: "bg-secondary text-secondary-foreground",
      valueClassName: "text-foreground",
      description: "Registros incluidos en el reporte",
    },
  ] as const;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Resumen general</h2>
          <p className="text-sm text-muted-foreground">
            Totales consolidados para el período seleccionado.
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          Vista resumida
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm"
            >
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl",
                      item.chipClassName,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={cn("text-3xl font-semibold tracking-tight", item.valueClassName)}>
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
