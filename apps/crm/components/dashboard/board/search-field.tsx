import { Search } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

const searchFieldDashboardPage = {
  container: cn(
    "flex h-[42px] w-full items-center gap-2.5 rounded-full bg-card pr-2 pl-3.5 text-sm text-[var(--tinta-apagada)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)] transition-shadow",
    "focus-within:shadow-[inset_0_0_0_1.5px_var(--granada),0_0_0_4px_var(--granada-100)]",
  ),
  icon: cn("size-[17px] shrink-0"),
  input: cn(
    "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-[var(--tinta-apagada)]",
  ),
  key: cn(
    "hidden h-[22px] min-w-[22px] items-center justify-center rounded-[7px] bg-secondary px-[5px] text-[11px] font-bold text-[var(--tinta-suave)] sm:inline-flex",
  ),
};

interface SearchFieldProps extends Omit<React.ComponentProps<"input">, "className"> {
  className?: string;
  /** Show the ⌘ K hint at the end of the field. */
  showShortcut?: boolean;
}

export function SearchField({ className, showShortcut = true, ...props }: SearchFieldProps) {
  return (
    <label className={cn(searchFieldDashboardPage.container, className)}>
      <Search aria-hidden="true" className={searchFieldDashboardPage.icon} />
      <input className={searchFieldDashboardPage.input} type="search" {...props} />
      {showShortcut ? (
        <>
          <kbd className={searchFieldDashboardPage.key}>⌘</kbd>
          <kbd className={searchFieldDashboardPage.key}>K</kbd>
        </>
      ) : null}
    </label>
  );
}
