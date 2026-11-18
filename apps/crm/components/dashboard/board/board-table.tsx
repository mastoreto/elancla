import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Board tables are CSS grids: the column template is passed once as a CSS variable
 * so the header and every row stay aligned. On phones the rows stack as wrapped flex.
 */
type GridStyle = React.CSSProperties & { "--board-columns": string };

const boardTableDashboardPage = {
  head: cn(
    "hidden rounded-[14px] bg-secondary px-[18px] py-3 text-xs font-bold text-[var(--tinta-suave)]",
    "sm:grid sm:grid-cols-(--board-columns) sm:items-center sm:gap-3.5",
  ),
  list: cn("flex flex-col gap-1"),
  row: cn(
    "relative flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border-b border-border/60 px-4 py-[13px] text-sm",
    "sm:grid sm:grid-cols-(--board-columns) sm:items-center sm:gap-3.5 sm:px-[18px]",
  ),
  rowSelected: cn("border-b-0 bg-(--granada-50)"),
  rowLink: cn(
    "after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring",
  ),
  raised: cn("relative z-10"),
};

interface BoardTableHeadProps {
  columns: string;
  labels: string[];
}

export function BoardTableHead({ columns, labels }: BoardTableHeadProps) {
  return (
    <div
      aria-hidden="true"
      className={boardTableDashboardPage.head}
      style={{ "--board-columns": columns } as GridStyle}
    >
      {labels.map((label, index) => (
        // Labels can repeat (empty action column), so the position is the stable key.
        // biome-ignore lint/suspicious/noArrayIndexKey: static header labels
        <span key={`${label}-${index}`}>{label}</span>
      ))}
    </div>
  );
}

export function BoardTableList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn(boardTableDashboardPage.list, className)} {...props} />;
}

interface BoardTableRowProps extends React.ComponentProps<"li"> {
  columns: string;
  selected?: boolean;
}

export function BoardTableRow({
  columns,
  selected = false,
  className,
  style,
  ...props
}: BoardTableRowProps) {
  return (
    <li
      className={cn(
        boardTableDashboardPage.row,
        selected && boardTableDashboardPage.rowSelected,
        className,
      )}
      style={{ ...style, "--board-columns": columns } as GridStyle}
      {...props}
    />
  );
}

/** Classes for the main cell button/link that makes the whole row clickable. */
export const boardTableRowLinkClass = boardTableDashboardPage.rowLink;
/** Classes that lift a cell (e.g. action buttons) above the row's stretched link. */
export const boardTableRaisedClass = boardTableDashboardPage.raised;
