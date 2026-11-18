import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statCardDashboardPage = {
  card: cn(
    "relative flex flex-col gap-[22px] overflow-hidden rounded-[26px] bg-card p-5 shadow-(--sombra)",
  ),
  cardHighlighted: cn(
    "bg-(image:--grad-granada) text-white shadow-[0_20px_34px_-20px_rgba(194,58,78,0.9)]",
  ),
  glow: cn(
    "absolute -top-[50px] -right-10 size-[180px] rounded-full bg-[radial-gradient(circle,rgba(242,225,182,0.55),transparent_65%)]",
  ),
  top: cn("relative flex items-center justify-between"),
  label: cn("text-sm font-semibold text-[var(--tinta-suave)]"),
  labelHighlighted: cn("text-white"),
  arrow: cn(
    "relative inline-flex size-9 items-center justify-center rounded-full bg-card text-foreground",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  arrowHighlighted: cn(
    "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]",
  ),
  value: cn(
    "relative font-display text-4xl leading-none font-semibold tracking-tight whitespace-nowrap tabular-nums",
  ),
  detail: cn("relative flex items-center gap-2 text-xs text-[var(--tinta-apagada)]"),
  detailHighlighted: cn("text-white/90"),
  chip: cn("rounded-md bg-secondary px-[7px] py-0.5 font-bold text-[var(--tinta-suave)]"),
  chipHighlighted: cn("bg-white/20 text-white"),
  icon: cn("size-4"),
  chipIcon: cn("size-3"),
};

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  /** Rose gradient variant used for the card that needs attention. */
  highlighted?: boolean;
  /** When set the arrow becomes a link; otherwise it is decorative. */
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  detail,
  highlighted = false,
  href,
  className,
}: StatCardProps) {
  const arrowClasses = cn(
    statCardDashboardPage.arrow,
    highlighted && statCardDashboardPage.arrowHighlighted,
  );
  const arrow = <ArrowUpRight aria-hidden="true" className={statCardDashboardPage.icon} />;

  return (
    <article
      className={cn(
        statCardDashboardPage.card,
        highlighted && statCardDashboardPage.cardHighlighted,
        className,
      )}
    >
      {highlighted ? <span aria-hidden="true" className={statCardDashboardPage.glow} /> : null}
      <div className={statCardDashboardPage.top}>
        <span
          className={cn(
            statCardDashboardPage.label,
            highlighted && statCardDashboardPage.labelHighlighted,
          )}
        >
          {label}
        </span>
        {href ? (
          <Link aria-label={`Ver ${label}`} className={arrowClasses} href={href}>
            {arrow}
          </Link>
        ) : (
          <span aria-hidden="true" className={arrowClasses}>
            {arrow}
          </span>
        )}
      </div>
      <b className={statCardDashboardPage.value}>{value}</b>
      <span
        className={cn(
          statCardDashboardPage.detail,
          highlighted && statCardDashboardPage.detailHighlighted,
        )}
      >
        <span
          className={cn(
            statCardDashboardPage.chip,
            highlighted && statCardDashboardPage.chipHighlighted,
          )}
        >
          <ArrowUpRight aria-hidden="true" className={statCardDashboardPage.chipIcon} />
        </span>
        {detail}
      </span>
    </article>
  );
}

const statCardGridDashboardPage = {
  grid: cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"),
};

export function StatCardGrid({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(statCardGridDashboardPage.grid, className)} {...props} />;
}
