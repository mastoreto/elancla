import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

const settingsSummaryCardSettingsPage = {
  card: cn("border-border/60 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm"),
  block: cn(
    "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary",
  ),
};

export function SettingsSummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SettingsSummaryCardProps) {
  return (
    <Card className={settingsSummaryCardSettingsPage.card}>
      <CardContent className="flex items-start gap-4 pt-6">
        <div className={settingsSummaryCardSettingsPage.block}>
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
