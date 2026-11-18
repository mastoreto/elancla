import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PodcastStatus } from "../types";

const podcastStatusBadgeContentPage = {
  draft: cn("border-border text-muted-foreground bg-muted/50"),
};

const statusConfig: Record<PodcastStatus, { label: string; className: string }> = {
  published: {
    label: "Publicado",
    className: "border-income/30 text-income bg-income/5",
  },
  draft: {
    label: "Borrador",
    className: podcastStatusBadgeContentPage.draft,
  },
  paused: {
    label: "Pausado",
    className: "border-oro/30 text-warning bg-oro/5",
  },
};

interface PodcastStatusBadgeProps {
  status: PodcastStatus;
}

export function PodcastStatusBadge({ status }: PodcastStatusBadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}
