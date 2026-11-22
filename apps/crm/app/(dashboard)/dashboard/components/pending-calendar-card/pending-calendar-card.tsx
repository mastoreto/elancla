import type { CalendarPendingDto, PendingYearStatus } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const YEAR_STATUS_SENTENCES: Record<PendingYearStatus, string> = {
  missing: "todavía no está creado",
  draft: "está en borrador y falta publicarlo",
  published: "ya está publicado",
};

const pendingCalendarCardDashboardPage = {
  header: cn("mb-3 flex items-center gap-2"),
  title: cn("font-display text-[22px] font-medium tracking-tight"),
  spacer: cn("flex-1"),
  list: cn("flex flex-col gap-1.5 text-[13.5px] leading-snug text-[var(--tinta-suave)]"),
};

function reviewsSentence(count: number): string | null {
  if (count === 0) return null;
  return count === 1
    ? "1 actividad con revisión anual por confirmar."
    : `${count} actividades con revisión anual por confirmar.`;
}

interface PendingCalendarCardProps {
  /** `null` when the user cannot read the calendar or it failed to load: nothing is shown. */
  pending: CalendarPendingDto | null;
}

/** Reminder of what the calendar of the year about to start still needs; hidden when all is done. */
export function PendingCalendarCard({ pending }: PendingCalendarCardProps) {
  if (!pending?.hasPending) return null;
  const reviews = reviewsSentence(pending.pendingReviews.length);
  return (
    <BoardCard data-testid="pending-calendar-card" surface="gold">
      <div className={pendingCalendarCardDashboardPage.header}>
        <h2 className={pendingCalendarCardDashboardPage.title}>Calendario {pending.year}</h2>
        <span className={pendingCalendarCardDashboardPage.spacer} />
        <BoardButton href={getChurchRoutePath("calendar")} size="sm" variant="dark">
          Revisar
        </BoardButton>
      </div>
      <ul className={pendingCalendarCardDashboardPage.list}>
        <li>
          El año {pending.year} {YEAR_STATUS_SENTENCES[pending.yearStatus]}.
        </li>
        {reviews ? <li>{reviews}</li> : null}
      </ul>
    </BoardCard>
  );
}
