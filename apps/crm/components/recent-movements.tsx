"use client";

import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getChurchRoutePath } from "@/lib/church";
import { movements } from "@/lib/data";
import { cn } from "@/lib/utils";

const recentMovementsSharedPage = {
  cardHeader: cn("flex flex-row items-center justify-between"),
  block: cn("flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"),
  blockFlex: cn(
    "flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
  ),
};

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
  return format(date, "MMM d");
}

export function RecentMovements() {
  const [mounted, setMounted] = useState(false);
  const recentMovements = movements.slice(0, 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader className={recentMovementsSharedPage.cardHeader}>
          <div>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>Últimas 5 transacciones financieras</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild={true}>
            <Link href={getChurchRoutePath("movements")}>Ver todo</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={recentMovementsSharedPage.block}>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={recentMovementsSharedPage.cardHeader}>
        <div>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>Últimas 5 transacciones financieras</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild={true}>
          <Link href={getChurchRoutePath("movements")}>Ver todo</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMovements.map((movement) => (
            <div key={movement.id} className={recentMovementsSharedPage.blockFlex}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center",
                    movement.type === "income"
                      ? "bg-income/10 text-income"
                      : "bg-expense/10 text-expense",
                  )}
                >
                  {movement.type === "income" ? (
                    <ArrowDownRight className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{movement.concept}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(movement.date)}
                    {movement.project && ` • ${movement.project}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    movement.type === "income"
                      ? "border-income/30 text-income bg-income/5"
                      : "border-expense/30 text-expense bg-expense/5",
                  )}
                >
                  {movement.type}
                </Badge>
                <span
                  className={cn(
                    "font-semibold text-sm min-w-[100px] text-right",
                    movement.type === "income" ? "text-income" : "text-expense",
                  )}
                >
                  {movement.type === "income" ? "+" : "-"}
                  {formatCurrency(movement.amount, movement.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
