import { ArrowDownLeft, ArrowUpRight, BadgeDollarSign } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { ReportMovementRow } from "../types/index";
import { ReportDataState } from "./report-data-state";
import { ReportSectionShell } from "./report-section-shell";

const reportMovementsTableReportsPage = {
  icon: cn("flex size-10 items-center justify-center rounded-full"),
  expenseBadge: cn("border-expense/30 bg-expense/5 text-expense"),
};

interface ReportMovementsTableProps {
  movements: ReportMovementRow[];
  isLoading?: boolean;
  errorMessage?: string | null;
}

const loadingColumns = [
  "Fecha",
  "Concepto",
  "Tipo",
  "Ministerio",
  "Proyecto",
  "Moneda",
  "Monto",
] as const;

const loadingRowIds = ["row-a", "row-b", "row-c", "row-d", "row-e", "row-f"] as const;

function formatCurrency(amount: number, currency: ReportMovementRow["currency"]) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function TableLoadingState() {
  return (
    <Table className="min-w-[920px]">
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          {loadingColumns.map((column) => (
            <TableHead key={column} className="px-6 font-semibold">
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loadingRowIds.map((rowId) => (
          <TableRow key={rowId}>
            <TableCell className="px-6 py-4">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-4">
              <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
            <TableCell className="px-6 py-4">
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell className="px-6 py-4">
              <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell className="px-6 py-4">
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell className="px-6 py-4 text-right">
              <Skeleton className="ml-auto h-4 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ReportMovementsTable({
  movements,
  isLoading = false,
  errorMessage,
}: ReportMovementsTableProps) {
  const recordsLabel = `${movements.length} registros`;
  let content: ReactNode;

  if (isLoading) {
    content = (
      <div className="pb-2">
        <TableLoadingState />
      </div>
    );
  } else if (errorMessage) {
    content = (
      <div className="px-6 py-6">
        <ReportDataState
          variant="error"
          title="Ocurrió un error al mostrar los datos"
          description={errorMessage}
        />
      </div>
    );
  } else if (movements.length === 0) {
    content = (
      <div className="px-6 py-6">
        <ReportDataState
          variant="empty"
          title="Sin movimientos disponibles"
          description="No hay datos para los filtros seleccionados"
        />
      </div>
    );
  } else {
    content = (
      <Table className="min-w-[920px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="px-6 font-semibold">Fecha</TableHead>
            <TableHead className="px-6 font-semibold">Concepto</TableHead>
            <TableHead className="px-6 font-semibold">Tipo</TableHead>
            <TableHead className="px-6 font-semibold">Ministerio</TableHead>
            <TableHead className="px-6 font-semibold">Proyecto</TableHead>
            <TableHead className="px-6 font-semibold">Moneda</TableHead>
            <TableHead className="px-6 text-right font-semibold">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const isIncome = movement.type === "INCOME";
            const MovementIcon = isIncome ? ArrowDownLeft : ArrowUpRight;

            return (
              <TableRow key={movement.id}>
                <TableCell className="px-6 py-4 text-muted-foreground">
                  {formatDate(movement.date)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        reportMovementsTableReportsPage.icon,
                        isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense",
                      )}
                    >
                      <MovementIcon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{movement.concept}</p>
                      <p className="text-xs text-muted-foreground">Movimiento del reporte</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1",
                      isIncome
                        ? "border-income/30 bg-income/5 text-income"
                        : reportMovementsTableReportsPage.expenseBadge,
                    )}
                  >
                    {isIncome ? "Ingreso" : "Egreso"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4">{movement.ministry}</TableCell>
                <TableCell className="px-6 py-4">{movement.project}</TableCell>
                <TableCell className="px-6 py-4">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-mono">
                    {movement.currency}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <BadgeDollarSign className="size-4 text-muted-foreground" />
                    <span
                      className={cn("font-semibold", isIncome ? "text-income" : "text-expense")}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(movement.amount, movement.currency)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <ReportSectionShell
      title="Movimientos"
      description="Detalle de ingresos y egresos incluidos en el reporte."
      action={
        !isLoading && !errorMessage ? (
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {recordsLabel}
          </Badge>
        ) : null
      }
      contentClassName="px-0 pt-0"
    >
      {content}
    </ReportSectionShell>
  );
}
