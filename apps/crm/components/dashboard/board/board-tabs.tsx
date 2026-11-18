"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

const boardTabsDashboardPage = {
  list: cn("flex w-full border-b border-border"),
  tab: cn(
    "-mb-px inline-flex items-center gap-2 border-b-[3px] border-transparent px-1 py-3 mr-[22px] text-[14.5px] font-medium",
    "text-[var(--tinta-apagada)] transition-colors hover:text-foreground",
  ),
  tabActive: cn("border-[var(--oro)] font-bold text-foreground"),
  count: cn(
    "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[11px] font-extrabold text-[var(--tinta-suave)]",
  ),
};

export interface BoardTabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface BoardTabsProps<T extends string> {
  label: string;
  items: BoardTabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  children?: React.ReactNode;
}

/** Underlined tab bar (gold underline on the active tab). */
export function BoardTabs<T extends string>({
  label,
  items,
  value,
  onValueChange,
  className,
}: BoardTabsProps<T>) {
  return (
    <div aria-label={label} className={cn(boardTabsDashboardPage.list, className)} role="tablist">
      {items.map((item) => (
        <button
          aria-selected={item.value === value}
          className={cn(
            boardTabsDashboardPage.tab,
            item.value === value && boardTabsDashboardPage.tabActive,
          )}
          key={item.value}
          onClick={() => onValueChange(item.value)}
          role="tab"
          type="button"
        >
          {item.label}
          {item.count === undefined ? null : (
            <span className={boardTabsDashboardPage.count}>{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
