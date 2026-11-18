import type * as React from "react";
import { cn } from "@/lib/utils";

type BrandMarkProps = React.ComponentProps<"div"> & {
  iconClassName?: string;
};

const brandMarkDashboardPage = {
  container: cn(
    "flex size-9 shrink-0 items-center justify-center rounded-xl bg-(image:--grad-granada) text-primary-foreground",
  ),
  icon: cn("size-[22px]"),
};

export function BrandMark({ className, iconClassName, ...props }: BrandMarkProps) {
  return (
    <div className={cn(brandMarkDashboardPage.container, className)} {...props}>
      <svg
        aria-hidden="true"
        className={cn(brandMarkDashboardPage.icon, iconClassName)}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="5.6" fill="var(--oro-100)" r="2.4" />
        <rect fill="currentColor" height="10.5" rx="2" width="4" x="10" y="9.5" />
      </svg>
    </div>
  );
}
