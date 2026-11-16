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

interface SettingsSectionShellProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SettingsSectionShell({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SettingsSectionShellProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm",
        className,
      )}
    >
      <CardHeader className="gap-3 border-b border-border/50 bg-gradient-to-r from-transparent via-transparent to-muted/30">
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
