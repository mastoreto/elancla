import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogStatus } from "../types";

const statusConfig: Record<BlogStatus, { label: string; className: string }> = {
  published: {
    label: "Publicado",
    className: "border-income/30 text-income bg-income/5",
  },
  draft: {
    label: "Borrador",
    className: "border-border text-muted-foreground bg-muted/50",
  },
  paused: {
    label: "Pausado",
    className: "border-oro/30 text-warning bg-oro/5",
  },
};

interface BlogPostStatusBadgeProps {
  status: BlogStatus;
}

export function BlogPostStatusBadge({ status }: BlogPostStatusBadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}
