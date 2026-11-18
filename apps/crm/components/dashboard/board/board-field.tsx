import type * as React from "react";
import { cn } from "@/lib/utils";

/** Shared control looks so inputs, selects and date pickers read as one family. */
export const boardControlStyles = {
  shell: cn(
    "flex min-h-12 w-full items-center gap-2.5 rounded-2xl bg-card px-4 text-sm text-foreground",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition-shadow",
    "focus-within:shadow-[inset_0_0_0_1.5px_var(--granada),0_0_0_4px_var(--granada-100)]",
  ),
  input: cn(
    "min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-[var(--tinta-apagada)]",
  ),
  textarea: cn("min-h-[88px] resize-none py-3.5"),
  select: cn(
    "w-full gap-2.5 rounded-2xl border-0 bg-card px-4 text-sm shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
    "data-[size=default]:h-12 data-[placeholder]:text-[var(--tinta-apagada)]",
  ),
  /** Filter pill used in list toolbars (works on a button or a Select trigger). */
  pill: cn(
    "inline-flex h-[42px] w-auto items-center gap-2 rounded-full border-0 bg-card px-3.5 text-[13.5px] font-semibold whitespace-nowrap",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] data-[size=default]:h-[42px]",
  ),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
};

const boardFieldDashboardPage = {
  container: cn("flex w-full flex-col gap-[7px]"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
};

interface BoardFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function BoardField({ label, htmlFor, className, children }: BoardFieldProps) {
  return (
    <div className={cn(boardFieldDashboardPage.container, className)}>
      <label className={boardFieldDashboardPage.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
