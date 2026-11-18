import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ReportDataState } from "./report-data-state";
import { ReportSectionShell } from "./report-section-shell";

interface ReportChartsSectionProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  errorMessage?: string | null;
}

const loadingChartIds = ["chart-a", "chart-b"] as const;
const loadingChipIds = ["chip-a", "chip-b", "chip-c", "chip-d"] as const;

const comparisonBars = [
  { label: "Ene", incomeHeight: 58, expenseHeight: 38 },
  { label: "Feb", incomeHeight: 74, expenseHeight: 52 },
  { label: "Mar", incomeHeight: 88, expenseHeight: 63 },
  { label: "Abr", incomeHeight: 70, expenseHeight: 44 },
  { label: "May", incomeHeight: 96, expenseHeight: 68 },
] as const;

const ministrySegments = [
  { label: "Acción social", value: "32%", colorClassName: "bg-[var(--color-chart-1)]" },
  { label: "Juventud", value: "28%", colorClassName: "bg-[var(--color-chart-3)]" },
  { label: "Niños", value: "22%", colorClassName: "bg-[var(--color-chart-4)]" },
  { label: "Misiones", value: "18%", colorClassName: "bg-[var(--color-chart-5)]" },
] as const;

function ChartsLoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {loadingChartIds.map((chartId) => (
        <Card key={chartId} className="border-border/60">
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {loadingChipIds.map((chipId) => (
                <Skeleton key={chipId} className="h-6 w-full rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReportChartsSection({
  isLoading = false,
  isEmpty = false,
  errorMessage,
}: ReportChartsSectionProps) {
  return (
    <ReportSectionShell
      title="Visualizaciones"
      description="Contenedores listos para conectar gráficos cuando la capa de datos esté disponible."
    >
      {isLoading ? (
        <ChartsLoadingState />
      ) : errorMessage ? (
        <ReportDataState
          variant="error"
          title="Ocurrió un error al mostrar los datos"
          description={errorMessage}
        />
      ) : isEmpty ? (
        <ReportDataState
          variant="empty"
          title="Sin gráficos para mostrar"
          description="No hay datos para los filtros seleccionados"
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/60 bg-gradient-to-b from-card to-muted/20 shadow-none">
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Ingresos vs Egresos</CardTitle>
                  <CardDescription>Bloque visual de comparación mensual</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Placeholder
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid h-60 grid-cols-5 gap-4 rounded-2xl border border-dashed border-border/60 bg-gradient-to-b from-muted/20 to-background p-4">
                {comparisonBars.map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center justify-end gap-3">
                    <div className="flex h-full items-end gap-2">
                      <div
                        className="w-5 rounded-t-full bg-income/85"
                        style={{ height: `${bar.incomeHeight}%` }}
                      />
                      <div
                        className="w-5 rounded-t-full bg-expense/80"
                        style={{ height: `${bar.expenseHeight}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{bar.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full bg-income/10 px-3 py-1 text-income hover:bg-income/10">
                  Ingresos
                </Badge>
                <Badge className="rounded-full bg-expense/10 px-3 py-1 text-expense hover:bg-expense/10">
                  Egresos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-b from-card to-muted/20 shadow-none">
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Distribución por ministerio</CardTitle>
                  <CardDescription>Bloque visual para distribución porcentual</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Placeholder
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid items-center gap-6 lg:grid-cols-[220px_1fr]">
                <div className="mx-auto flex size-52 items-center justify-center rounded-full bg-muted/20">
                  <div
                    className="flex size-44 items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(var(--color-chart-1) 0 32%, var(--color-chart-3) 32% 60%, var(--color-chart-4) 60% 82%, var(--color-chart-5) 82% 100%)",
                    }}
                  >
                    <div className="flex size-[6.5rem] flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
                      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Total
                      </span>
                      <span className="text-xl font-semibold tracking-tight">100%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {ministrySegments.map((segment) => (
                    <div
                      key={segment.label}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`size-3 rounded-full ${segment.colorClassName}`} />
                        <span className="text-sm font-medium">{segment.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{segment.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ReportSectionShell>
  );
}
