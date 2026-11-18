"use client";

import { format } from "date-fns";
import { CheckCircle2, MessageCircle, PlusCircle, XCircle } from "lucide-react";
import type { RequestTimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RequestTimelineProps {
  timeline: RequestTimelineEntry[];
}

const actionConfig = {
  created: {
    icon: PlusCircle,
    label: "Solicitud creada",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  approved: {
    icon: CheckCircle2,
    label: "Solicitud aprobada",
    color: "text-income",
    bgColor: "bg-income/20",
  },
  rejected: {
    icon: XCircle,
    label: "Solicitud rechazada",
    color: "text-expense",
    bgColor: "bg-expense/20",
  },
  comment: {
    icon: MessageCircle,
    label: "Comentario añadido",
    color: "text-accent",
    bgColor: "bg-accent/20",
  },
};

export function RequestTimeline({ timeline }: RequestTimelineProps) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((entry, idx) => {
          const config = actionConfig[entry.action];
          const Icon = config.icon;
          const isLast = idx === timeline.length - 1;

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex gap-3">
                  <div>
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full ring-8 ring-background",
                        config.bgColor,
                      )}
                    >
                      <Icon className={cn("size-4", config.color)} />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{entry.user}</span>{" "}
                      <span className="text-muted-foreground">{config.label.toLowerCase()}</span>
                    </p>
                    {entry.comment && (
                      <p className="mt-1 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                        {entry.comment}
                      </p>
                    )}
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")}
                    </time>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
