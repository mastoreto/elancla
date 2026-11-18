import type * as React from "react";
import { cn } from "@/lib/utils";

const SURFACES = {
  white: cn("bg-card shadow-(--sombra)"),
  gold: cn("bg-[#f8efd9]"),
  mint: cn("bg-[#e7f3ec]"),
  rose: cn("bg-[#fce8ea]"),
  ink: cn("bg-(--vino) text-white"),
} satisfies Record<string, string>;

export type BoardCardSurface = keyof typeof SURFACES;

const boardCardDashboardPage = {
  base: cn("rounded-[28px] p-[22px]"),
};

interface BoardCardProps extends React.ComponentProps<"section"> {
  surface?: BoardCardSurface;
}

export function BoardCard({ surface = "white", className, ...props }: BoardCardProps) {
  return (
    <section className={cn(boardCardDashboardPage.base, SURFACES[surface], className)} {...props} />
  );
}

const boardCardHeaderDashboardPage = {
  container: cn("mb-3.5 flex items-start gap-2.5"),
  text: cn("flex flex-1 flex-col gap-[3px]"),
  title: cn("font-display text-[21px] font-medium tracking-tight"),
  subtitle: cn("text-[13px] text-[var(--tinta-apagada)]"),
};

interface BoardCardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function BoardCardHeader({ title, subtitle, action, className }: BoardCardHeaderProps) {
  return (
    <div className={cn(boardCardHeaderDashboardPage.container, className)}>
      <div className={boardCardHeaderDashboardPage.text}>
        <h2 className={boardCardHeaderDashboardPage.title}>{title}</h2>
        {subtitle ? (
          <span className={boardCardHeaderDashboardPage.subtitle}>{subtitle}</span>
        ) : null}
      </div>
      {action}
    </div>
  );
}
