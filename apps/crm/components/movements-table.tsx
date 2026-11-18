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

const movementsTableMovementsPage = {
  empty: cn(
    "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card p-12 text-center",
  ),
  emptyIcon: cn("mb-4 flex size-12 items-center justify-center rounded-full bg-muted"),
  emptyGlyph: cn("size-6 text-muted-foreground"),
  emptyTitle: cn("mb-1 font-semibold text-foreground"),
  emptyText: cn("max-w-[250px] text-sm text-muted-foreground"),
  container: cn("overflow-hidden rounded-lg border border-border bg-card"),
  headerRow: cn("bg-muted/50 hover:bg-muted/50"),
  head: cn("font-semibold"),
  headRight: cn("text-right font-semibold"),
  row: cn("group"),
  date: cn("font-medium text-muted-foreground"),
  concept: cn("flex items-center gap-2"),
  conceptIcon: cn("flex size-7 shrink-0 items-center justify-center rounded-full"),
  conceptIconGlyph: cn("size-3.5"),
  conceptName: cn("font-medium"),
  conceptDescription: cn("line-clamp-1 text-xs text-muted-foreground"),
  typeBadge: cn("capitalize"),
  currencyBadge: cn("font-mono"),
  amountCell: cn("text-right"),
  amount: cn("font-semibold"),
  project: cn("bg-accent/5 text-foreground"),
  noProject: cn("text-sm text-muted-foreground"),
};

const movementsTableToneMovementsPage = {
  income: {
    icon: "bg-income/10 text-income",
    badge: "border-income/30 bg-income/5 text-income",
    amount: "text-income",
  },
  expense: {
    icon: "bg-expense/10 text-expense",
    badge: "border-expense/30 bg-expense/5 text-expense",
    amount: "text-expense",
  },
} as const;

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
      <div className={movementsTableMovementsPage.empty}>
        <div className={movementsTableMovementsPage.emptyIcon}>
          <ArrowUpRight className={movementsTableMovementsPage.emptyGlyph} />
        </div>
        <h3 className={movementsTableMovementsPage.emptyTitle}>No hay movimientos encontrados</h3>
        <p className={movementsTableMovementsPage.emptyText}>
          Intenta ajustando tus filtros o crea un nuevo movimiento
        </p>
      </div>
    );
  }

  return (
    <div className={movementsTableMovementsPage.container}>
      <Table>
        <TableHeader>
          <TableRow className={movementsTableMovementsPage.headerRow}>
            <TableHead className={movementsTableMovementsPage.head}>Fecha</TableHead>
            <TableHead className={movementsTableMovementsPage.head}>Concepto</TableHead>
            <TableHead className={movementsTableMovementsPage.head}>Tipo</TableHead>
            <TableHead className={movementsTableMovementsPage.head}>Moneda</TableHead>
            <TableHead className={movementsTableMovementsPage.headRight}>Cantidad</TableHead>
            <TableHead className={movementsTableMovementsPage.head}>Proyecto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id} className={movementsTableMovementsPage.row}>
              <TableCell className={movementsTableMovementsPage.date}>
                {formatDate(movement.date)}
              </TableCell>
              <TableCell>
                <div className={movementsTableMovementsPage.concept}>
                  <div
                    className={cn(
                      movementsTableMovementsPage.conceptIcon,
                      movementsTableToneMovementsPage[movement.type].icon,
                    )}
                  >
                    {movement.type === "income" ? (
                      <ArrowDownRight className={movementsTableMovementsPage.conceptIconGlyph} />
                    ) : (
                      <ArrowUpRight className={movementsTableMovementsPage.conceptIconGlyph} />
                    )}
                  </div>
                  <div>
                    <p className={movementsTableMovementsPage.conceptName}>{movement.concept}</p>
                    {movement.description && (
                      <p className={movementsTableMovementsPage.conceptDescription}>
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
                    movementsTableMovementsPage.typeBadge,
                    movementsTableToneMovementsPage[movement.type].badge,
                  )}
                >
                  {movement.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={movementsTableMovementsPage.currencyBadge}>
                  {movement.currency}
                </Badge>
              </TableCell>
              <TableCell className={movementsTableMovementsPage.amountCell}>
                <span
                  className={cn(
                    movementsTableMovementsPage.amount,
                    movementsTableToneMovementsPage[movement.type].amount,
                  )}
                >
                  {movement.type === "income" ? "+" : "-"}
                  {formatCurrency(movement.amount, movement.currency)}
                </span>
              </TableCell>
              <TableCell>
                {movement.project ? (
                  <Badge variant="outline" className={movementsTableMovementsPage.project}>
                    {movement.project}
                  </Badge>
                ) : (
                  <span className={movementsTableMovementsPage.noProject}>-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
