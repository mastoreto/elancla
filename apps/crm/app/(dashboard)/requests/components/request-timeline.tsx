"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, MessageCircle, PlusCircle, XCircle } from "lucide-react";
import type { RequestTimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RequestTimelineProps {
  timeline: RequestTimelineEntry[];
}

const requestTimelineRequestsPageActions = {
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
    color: "text-accent-foreground",
    bgColor: "bg-accent",
  },
} as const;

export function RequestTimeline({ timeline }: RequestTimelineProps) {
  const requestTimelineRequestsPage = {
    list: cn("flex flex-col"),
    item: cn("relative flex gap-3 pb-6 last:pb-0"),
    connector: cn("absolute top-8 bottom-0 left-4 -ml-px w-0.5 bg-border"),
    icon: cn("relative flex size-8 shrink-0 items-center justify-center rounded-full"),
    iconGlyph: cn("size-4"),
    body: cn("flex min-w-0 flex-1 flex-col gap-0.5 pt-1"),
    title: cn("text-sm"),
    user: cn("font-medium text-foreground"),
    action: cn("text-muted-foreground"),
    comment: cn("mt-1 rounded-md bg-muted p-2 text-sm text-muted-foreground"),
    time: cn("text-xs text-muted-foreground"),
  };

  return (
    <ul className={requestTimelineRequestsPage.list}>
      {timeline.map((entry, index) => {
        const config = requestTimelineRequestsPageActions[entry.action];
        const Icon = config.icon;
        const isLast = index === timeline.length - 1;

        return (
          <li className={requestTimelineRequestsPage.item} key={entry.id}>
            {isLast ? null : (
              <span aria-hidden="true" className={requestTimelineRequestsPage.connector} />
            )}
            <span className={cn(requestTimelineRequestsPage.icon, config.bgColor)}>
              <Icon className={cn(requestTimelineRequestsPage.iconGlyph, config.color)} />
            </span>
            <div className={requestTimelineRequestsPage.body}>
              <p className={requestTimelineRequestsPage.title}>
                <span className={requestTimelineRequestsPage.user}>{entry.user}</span>{" "}
                <span className={requestTimelineRequestsPage.action}>
                  {config.label.toLowerCase()}
                </span>
              </p>
              {entry.comment ? (
                <p className={requestTimelineRequestsPage.comment}>{entry.comment}</p>
              ) : null}
              <time className={requestTimelineRequestsPage.time}>
                {format(new Date(entry.date), "d MMM yyyy, HH:mm", { locale: es })}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
