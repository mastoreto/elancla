import { AlertCircle, FileSearch } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface ReportDataStateProps {
  variant: "empty" | "error";
  title?: string;
  description: string;
  className?: string;
}

export function ReportDataState({ variant, title, description, className }: ReportDataStateProps) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : FileSearch;

  return (
    <Empty className={cn("border border-dashed border-border/60 bg-muted/20 py-10", className)}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className={cn(
            isError ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent",
          )}
        >
          <Icon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>
          {title ?? (isError ? "No se pudo mostrar la sección" : "Sin resultados")}
        </EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
