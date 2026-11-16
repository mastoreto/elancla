"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MovementsTableProps {
  movements: Movement[];
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  // Parse date parts manually to avoid timezone issues
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MovementsTable({ movements }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <ArrowUpRight className="size-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No hay movimientos encontrados</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Intenta ajustando tus filtros o crea un nuevo movimiento
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Fecha</TableHead>
            <TableHead className="font-semibold">Concepto</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Moneda</TableHead>
            <TableHead className="font-semibold text-right">Cantidad</TableHead>
            <TableHead className="font-semibold">Proyecto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id} className="group">
              <TableCell className="font-medium text-muted-foreground">
                {formatDate(movement.date)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-7 rounded-full flex items-center justify-center shrink-0",
                      movement.type === "income"
                        ? "bg-income/10 text-income"
                        : "bg-expense/10 text-expense",
                    )}
                  >
                    {movement.type === "income" ? (
                      <ArrowDownRight className="size-3.5" />
                    ) : (
                      <ArrowUpRight className="size-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{movement.concept}</p>
                    {movement.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {movement.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    movement.type === "income"
                      ? "border-income/30 text-income bg-income/5"
                      : "border-expense/30 text-expense bg-expense/5",
                  )}
                >
                  {movement.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono">
                  {movement.currency}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    "font-semibold",
                    movement.type === "income" ? "text-income" : "text-expense",
                  )}
                >
                  {movement.type === "income" ? "+" : "-"}
                  {formatCurrency(movement.amount, movement.currency)}
                </span>
              </TableCell>
              <TableCell>
                {movement.project ? (
                  <Badge variant="outline" className="bg-accent/5 text-foreground">
                    {movement.project}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
