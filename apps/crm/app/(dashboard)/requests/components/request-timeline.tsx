import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, MessageSquare, Plus, X } from "lucide-react";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import type { RequestTimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RequestTimelineProps {
  timeline: RequestTimelineEntry[];
}

const ENTRY_CONFIG = {
  created: { icon: Plus, label: "Solicitud creada", tone: "gold" },
  approved: { icon: Check, label: "Solicitud aprobada", tone: "green" },
  rejected: { icon: X, label: "Solicitud rechazada", tone: "rose" },
  comment: { icon: MessageSquare, label: "Comentario", tone: "ink" },
} satisfies Record<
  RequestTimelineEntry["action"],
  { icon: typeof Plus; label: string; tone: IconBubbleTone }
>;

const requestTimelineRequestsPage = {
  list: cn("flex flex-col"),
  item: cn("flex gap-3.5"),
  rail: cn("flex flex-col items-center"),
  bubble: cn("size-[34px]"),
  bubbleIcon: cn("size-4"),
  connector: cn("my-1 min-h-5 w-0.5 flex-1 bg-border"),
  body: cn("flex flex-col gap-0.5 pb-4"),
  bodyLast: cn("pb-0"),
  title: cn("text-sm font-bold"),
  detail: cn("text-[13px] text-[var(--tinta-suave)]"),
  time: cn("text-xs text-[var(--tinta-apagada)]"),
};

export function RequestTimeline({ timeline }: RequestTimelineProps) {
  return (
    <ul className={requestTimelineRequestsPage.list}>
      {timeline.map((entry, index) => {
        const config = ENTRY_CONFIG[entry.action];
        const Icon = config.icon;
        const isLast = index === timeline.length - 1;

        return (
          <li className={requestTimelineRequestsPage.item} key={entry.id}>
            <div className={requestTimelineRequestsPage.rail}>
              <IconBubble className={requestTimelineRequestsPage.bubble} tone={config.tone}>
                <Icon aria-hidden="true" className={requestTimelineRequestsPage.bubbleIcon} />
              </IconBubble>
              {isLast ? null : (
                <span aria-hidden="true" className={requestTimelineRequestsPage.connector} />
              )}
            </div>
            <div
              className={cn(
                requestTimelineRequestsPage.body,
                isLast && requestTimelineRequestsPage.bodyLast,
              )}
            >
              <b className={requestTimelineRequestsPage.title}>{config.label}</b>
              <span className={requestTimelineRequestsPage.detail}>
                {entry.comment ? `“${entry.comment}”` : entry.user}
              </span>
              <time className={requestTimelineRequestsPage.time} dateTime={entry.date}>
                {format(new Date(entry.date), "d MMM · HH:mm", { locale: es })}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
