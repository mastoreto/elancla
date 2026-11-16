import type * as React from "react";
import { cn } from "@/lib/utils";

type BrandMarkProps = React.ComponentProps<"div"> & {
  iconClassName?: string;
};

export function BrandMark({ className, iconClassName, ...props }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground",
        className,
      )}
      {...props}
    >
      <svg
        aria-hidden="true"
        className={cn("size-5", iconClassName)}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 20 24"
      >
        <path d="M10 2v8" />
        <path d="M6 5h8" />
        <path d="M5 10c0 5 5 8 5 8s5-3 5-8" />
        <path d="M6 12h8" />
      </svg>
    </div>
  );
}
