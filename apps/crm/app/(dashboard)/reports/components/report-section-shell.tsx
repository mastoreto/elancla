import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const reportSectionShellReportsPage = {
  card: cn(
    "overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm",
  ),
  header: cn(
    "gap-3 border-b border-border/50 bg-gradient-to-r from-transparent via-transparent to-muted/35",
  ),
};

interface ReportSectionShellProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function ReportSectionShell({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  headerClassName,
}: ReportSectionShellProps) {
  return (
    <Card className={cn(reportSectionShellReportsPage.card, className)}>
      <CardHeader className={cn(reportSectionShellReportsPage.header, headerClassName)}>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("pt-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
