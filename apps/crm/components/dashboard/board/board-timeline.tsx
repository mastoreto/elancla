import type * as React from "react";
import { cn } from "@/lib/utils";
import { IconBubble, type IconBubbleTone } from "./icon-bubble";

export interface BoardTimelineItem {
  id: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: IconBubbleTone;
  title: string;
  detail?: string;
  /** Already formatted, e.g. "22 mar · 10:30". */
  time: string;
  dateTime?: string;
}

const boardTimelineDashboardPage = {
  list: cn("flex flex-col"),
  item: cn("flex gap-3.5"),
  rail: cn("flex flex-col items-center"),
  bubble: cn("size-[34px]"),
  icon: cn("size-4"),
  connector: cn("my-1 min-h-5 w-0.5 flex-1 bg-border"),
  body: cn("flex flex-col gap-0.5 pb-4"),
  bodyLast: cn("pb-0"),
  title: cn("text-sm font-bold"),
  detail: cn("text-[13px] text-[var(--tinta-suave)]"),
  time: cn("text-xs text-[var(--tinta-apagada)]"),
};

interface BoardTimelineProps {
  items: BoardTimelineItem[];
  className?: string;
}

/** Vertical history: tone bubbles joined by a rail, newest or oldest first as given. */
export function BoardTimeline({ items, className }: BoardTimelineProps) {
  return (
    <ul className={cn(boardTimelineDashboardPage.list, className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;
        return (
          <li className={boardTimelineDashboardPage.item} key={item.id}>
            <div className={boardTimelineDashboardPage.rail}>
              <IconBubble className={boardTimelineDashboardPage.bubble} tone={item.tone}>
                <Icon aria-hidden={true} className={boardTimelineDashboardPage.icon} />
              </IconBubble>
              {isLast ? null : (
                <span aria-hidden="true" className={boardTimelineDashboardPage.connector} />
              )}
            </div>
            <div
              className={cn(
                boardTimelineDashboardPage.body,
                isLast && boardTimelineDashboardPage.bodyLast,
              )}
            >
              <b className={boardTimelineDashboardPage.title}>{item.title}</b>
              {item.detail ? (
                <span className={boardTimelineDashboardPage.detail}>{item.detail}</span>
              ) : null}
              <time className={boardTimelineDashboardPage.time} dateTime={item.dateTime}>
                {item.time}
              </time>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
