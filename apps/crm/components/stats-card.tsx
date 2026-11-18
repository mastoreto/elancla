import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "income" | "expense";
}

const statsCardSharedPage = {
  title: cn("text-sm font-medium text-muted-foreground"),
  cardHeader: cn("flex flex-row items-center justify-between pb-2"),
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className={statsCardSharedPage.cardHeader}>
        <CardTitle className={statsCardSharedPage.title}>{title}</CardTitle>
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center",
            variant === "income" && "bg-income/10 text-income",
            variant === "expense" && "bg-expense/10 text-expense",
            variant === "default" && "bg-accent/10 text-accent",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p
            className={cn(
              "text-xs mt-1 font-medium",
              trend.isPositive ? "text-income" : "text-expense",
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
