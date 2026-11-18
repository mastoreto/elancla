import Link from "next/link";
import type * as React from "react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
  boardTableRaisedClass,
  boardTableRowLinkClass,
} from "@/components/dashboard/board/board-table";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";

export interface ContentTableRow {
  id: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: IconBubbleTone;
  title: string;
  subtitle: string;
  /** Row link target; the whole row becomes clickable. */
  href: string;
  /** One node per column between the title and the actions. */
  cells: React.ReactNode[];
  actions: React.ReactNode;
}

const contentTableDashboardPage = {
  card: cn("p-[18px]"),
  lead: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-10"),
  icon: cn("size-[18px]"),
  text: cn("flex min-w-0 flex-col gap-0.5"),
  title: cn("text-sm font-bold"),
  subtitle: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  actions: cn("flex justify-end gap-1.5"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

interface ContentTableProps {
  /** Grid template for the title, data columns and actions. */
  columns: string;
  labels: string[];
  rows: ContentTableRow[];
  emptyMessage: string;
  /** Rendered under the rows, usually the pagination. */
  footer?: React.ReactNode;
}

export function ContentTable({ columns, labels, rows, emptyMessage, footer }: ContentTableProps) {
  return (
    <BoardCard className={contentTableDashboardPage.card}>
      {rows.length === 0 ? (
        <p className={contentTableDashboardPage.empty}>{emptyMessage}</p>
      ) : (
        <>
          <BoardTableHead columns={columns} labels={labels} />
          <BoardTableList>
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <BoardTableRow columns={columns} key={row.id}>
                  <div className={contentTableDashboardPage.lead}>
                    <IconBubble className={contentTableDashboardPage.bubble} tone={row.tone}>
                      <Icon aria-hidden={true} className={contentTableDashboardPage.icon} />
                    </IconBubble>
                    <div className={contentTableDashboardPage.text}>
                      <Link
                        className={cn(boardTableRowLinkClass, contentTableDashboardPage.title)}
                        href={row.href}
                      >
                        {row.title}
                      </Link>
                      <span className={contentTableDashboardPage.subtitle}>{row.subtitle}</span>
                    </div>
                  </div>
                  {row.cells.map((cell, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: columns are positional.
                    <span key={index}>{cell}</span>
                  ))}
                  <div className={cn(contentTableDashboardPage.actions, boardTableRaisedClass)}>
                    {row.actions}
                  </div>
                </BoardTableRow>
              );
            })}
          </BoardTableList>
        </>
      )}
      {footer}
    </BoardCard>
  );
}
