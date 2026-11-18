import { ChartNoAxesColumn, CircleAlert, PiggyBank, Wallet } from "lucide-react";
import type { BudgetSummaryValues } from "@/app/(dashboard)/budgets/types/index";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type BudgetSummaryCardsProps = {
  summary: BudgetSummaryValues | null;
  isLoading?: boolean;
  isEmpty?: boolean;
  errorMessage?: string | null;
};

const summaryItems = [
  {
    key: "totalBudget",
    title: "Presupuesto total",
    description: "Asignaciones consolidadas por moneda",
    icon: Wallet,
  },
  {
    key: "totalUsed",
    title: "Total utilizado",
    description: "Consumo visible del periodo",
    icon: ChartNoAxesColumn,
  },
  {
    key: "totalAvailable",
    title: "Disponible total",
    description: "Saldo restante para nuevas operaciones",
    icon: PiggyBank,
  },
] as const;

export function BudgetSummaryCards({
  summary,
  isLoading = false,
  isEmpty = false,
  errorMessage,
}: BudgetSummaryCardsProps) {
  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <CircleAlert className="size-4" />
        <AlertTitle>Ocurrió un error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryItems.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key}>
            <CardHeader>
              <CardDescription>{item.title}</CardDescription>
              <CardAction>
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </div>
              </CardAction>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : isEmpty || !summary ? (
                  <span className="text-muted-foreground text-xl">Sin datos</span>
                ) : (
                  summary[item.key]
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {isEmpty || !summary ? "Sin datos disponibles" : item.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
