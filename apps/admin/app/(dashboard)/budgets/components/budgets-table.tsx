import { CircleAlert, PencilLine } from "lucide-react";
import { BudgetProgressBar } from "@/app/(dashboard)/budgets/components/budget-progress-bar";
import type { Budget } from "@/app/(dashboard)/budgets/types/index";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type BudgetsTableProps = {
  budgets: Budget[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onEdit?: (budget: Budget) => void;
};

const loadingRowIds = [
  "budget-loading-row-1",
  "budget-loading-row-2",
  "budget-loading-row-3",
  "budget-loading-row-4",
];

function formatCurrency(currency: Budget["currency"], amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(startDate: Date, endDate: Date) {
  const formatter = new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function getOwnerLabel(budget: Budget) {
  if (budget.project) {
    return {
      name: budget.project,
      type: "Proyecto",
    };
  }

  if (budget.ministry) {
    return {
      name: budget.ministry,
      type: "Ministerio",
    };
  }

  return {
    name: "Sin asignación",
    type: "Sin tipo",
  };
}

export function BudgetsTable({
  budgets,
  isLoading = false,
  errorMessage,
  onEdit,
}: BudgetsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de presupuestos</CardTitle>
        <CardDescription>
          Revisa asignaciones vigentes, disponibilidad y consumo visual por ministerio o proyecto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage ? (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>Ocurrió un error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ministerio / Proyecto</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Monto total</TableHead>
                <TableHead>Monto utilizado</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRowIds.map((rowId) => (
                <TableRow key={rowId}>
                  <TableCell className="whitespace-normal">
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="min-w-56 whitespace-normal">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : budgets.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 text-center">
            <p className="text-muted-foreground text-sm">No hay presupuestos registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ministerio / Proyecto</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Monto total</TableHead>
                <TableHead>Monto utilizado</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const owner = getOwnerLabel(budget);
                const availableAmount = budget.totalAmount - budget.usedAmount;

                return (
                  <TableRow key={budget.id}>
                    <TableCell className="whitespace-normal align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{budget.name || "Sin nombre"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{owner.name}</p>
                        <p className="text-muted-foreground text-xs">{owner.type}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">{budget.currency}</TableCell>
                    <TableCell className="align-top">
                      {formatCurrency(budget.currency, budget.totalAmount)}
                    </TableCell>
                    <TableCell className="min-w-64 whitespace-normal align-top">
                      <div className="space-y-3">
                        <p>{formatCurrency(budget.currency, budget.usedAmount)}</p>
                        <BudgetProgressBar
                          currency={budget.currency}
                          totalAmount={budget.totalAmount}
                          usedAmount={budget.usedAmount}
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "align-top font-medium",
                        availableAmount < 0 && "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {formatCurrency(budget.currency, availableAmount)}
                    </TableCell>
                    <TableCell className="whitespace-normal align-top">
                      {formatPeriod(budget.startDate, budget.endDate)}
                    </TableCell>
                    <TableCell className="align-top">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(budget)}
                      >
                        <PencilLine className="size-4" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
