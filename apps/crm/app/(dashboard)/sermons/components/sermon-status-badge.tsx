import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SermonStatus } from "../types";

interface SermonStatusBadgeProps {
  status: SermonStatus;
  className?: string;
}

const sermonStatusBadgeSermonsPageStatus = {
  published: { label: "Publicado", className: "bg-success-surface text-income" },
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground" },
} satisfies Record<SermonStatus, { label: string; className: string }>;

export function SermonStatusBadge({ status, className }: SermonStatusBadgeProps) {
  const config = sermonStatusBadgeSermonsPageStatus[status];
  const sermonStatusBadgeSermonsPage = {
    badge: cn("rounded-full border-0", config.className, className),
  };

  return (
    <Badge className={sermonStatusBadgeSermonsPage.badge} variant="secondary">
      {config.label}
    </Badge>
  );
}
