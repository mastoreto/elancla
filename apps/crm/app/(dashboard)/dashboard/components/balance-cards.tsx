import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type ChurchRouteSegment, getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { BalanceCard } from "../data/summary";

const balanceCardsDashboardPage = {
  grid: cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"),
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
  link: cn(
    "relative inline-flex size-9 items-center justify-center rounded-full bg-card text-foreground",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  linkHighlighted: cn("bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]"),
  value: cn(
    "relative font-display text-4xl leading-none font-semibold tracking-tight whitespace-nowrap tabular-nums",
  ),
  detail: cn("relative flex items-center gap-2 text-xs text-[var(--tinta-apagada)]"),
  detailHighlighted: cn("text-white/90"),
  detailChip: cn("rounded-md bg-secondary px-[7px] py-0.5 font-bold text-[var(--tinta-suave)]"),
  detailChipHighlighted: cn("bg-white/20 text-white"),
};

interface BalanceCardsProps {
  cards: BalanceCard[];
}

export function BalanceCards({ cards }: BalanceCardsProps) {
  return (
    <div className={balanceCardsDashboardPage.grid}>
      {cards.map((card) => {
        const highlighted = card.highlighted === true;
        return (
          <article
            className={cn(
              balanceCardsDashboardPage.card,
              highlighted && balanceCardsDashboardPage.cardHighlighted,
            )}
            key={card.id}
          >
            {highlighted ? <span className={balanceCardsDashboardPage.glow} /> : null}
            <div className={balanceCardsDashboardPage.top}>
              <span
                className={cn(
                  balanceCardsDashboardPage.label,
                  highlighted && balanceCardsDashboardPage.labelHighlighted,
                )}
              >
                {card.label}
              </span>
              <Link
                aria-label={`Ver ${card.label}`}
                className={cn(
                  balanceCardsDashboardPage.link,
                  highlighted && balanceCardsDashboardPage.linkHighlighted,
                )}
                href={getChurchRoutePath(card.href as ChurchRouteSegment)}
              >
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <b className={balanceCardsDashboardPage.value}>{card.value}</b>
            <span
              className={cn(
                balanceCardsDashboardPage.detail,
                highlighted && balanceCardsDashboardPage.detailHighlighted,
              )}
            >
              <span
                className={cn(
                  balanceCardsDashboardPage.detailChip,
                  highlighted && balanceCardsDashboardPage.detailChipHighlighted,
                )}
              >
                <ArrowUpRight aria-hidden="true" className="size-3" />
              </span>
              {card.detail}
            </span>
          </article>
        );
      })}
    </div>
  );
}
