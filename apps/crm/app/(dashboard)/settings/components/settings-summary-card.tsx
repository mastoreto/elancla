import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SettingsSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function SettingsSummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SettingsSummaryCardProps) {
  return (
    <Card className="border-border/60 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm">
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
