import type * as React from "react";
import { cn } from "@/lib/utils";

const TONES = {
  green: {
    pill: cn(
      "bg-[var(--vida-50)] text-[var(--vida)] shadow-[inset_0_0_0_1px_rgba(39,109,76,0.13)]",
    ),
    dot: cn("bg-[var(--vida)]"),
  },
  rose: {
    pill: cn("bg-[var(--granada-50)] text-primary shadow-[inset_0_0_0_1px_rgba(194,58,78,0.13)]"),
    dot: cn("bg-primary"),
  },
  gold: {
    pill: cn("bg-[var(--oro-50)] text-[var(--oro-texto)] shadow-[inset_0_0_0_1px_var(--oro-100)]"),
    dot: cn("bg-[var(--oro)]"),
  },
  ink: {
    pill: cn("bg-secondary text-[var(--tinta-suave)] shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]"),
    dot: cn("bg-[var(--tinta-apagada)]"),
  },
} satisfies Record<string, { pill: string; dot: string }>;

export type StatusPillTone = keyof typeof TONES;

const statusPillDashboardPage = {
  base: cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
  ),
  dot: cn("size-1.5 rounded-full"),
};

interface StatusPillProps extends React.ComponentProps<"span"> {
  tone?: StatusPillTone;
}

export function StatusPill({ tone = "ink", className, children, ...props }: StatusPillProps) {
  return (
    <span className={cn(statusPillDashboardPage.base, TONES[tone].pill, className)} {...props}>
      <span className={cn(statusPillDashboardPage.dot, TONES[tone].dot)} />
      {children}
    </span>
  );
}
