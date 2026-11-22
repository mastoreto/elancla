import type { CalendarPendingDto, PendingYearStatus } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { StatusPill, type StatusPillTone } from "@/components/dashboard/board/status-pill";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { formatPendingReview } from "../../utils/formatPendingReview";
import { ConfirmReviewButton } from "../confirm-review-button";
import { CreateYearButton } from "../create-year-button";

const YEAR_STATUS_LABELS: Record<PendingYearStatus, string> = {
  missing: "Falta crear",
  draft: "Borrador",
  published: "Publicado",
};

const YEAR_STATUS_TONES: Record<PendingYearStatus, StatusPillTone> = {
  missing: "rose",
  draft: "gold",
  published: "green",
};

const pendingYearCardCalendarPage = {
  list: cn("flex flex-col gap-2"),
  item: cn("flex flex-wrap items-center gap-3 rounded-[20px] bg-white/70 px-3 py-2.5"),
  text: cn("flex min-w-0 flex-1 basis-48 flex-col leading-snug"),
  title: cn("truncate text-[14px] font-bold"),
  when: cn("text-xs text-[var(--tinta-apagada)]"),
  footer: cn("mt-3.5 flex flex-wrap gap-2.5"),
};

interface PendingYearCardProps {
  pending: CalendarPendingDto;
  defaultLocale: string;
  /** Whether the user may confirm reviews and create the year (`events.edit`). */
  canEdit: boolean;
}

/** What is left before the year about to start is ready: creating/publishing it and the reviews. */
export function PendingYearCard({ pending, defaultLocale, canEdit }: PendingYearCardProps) {
  const { year, yearStatus, pendingReviews } = pending;
  return (
    <BoardCard data-testid="pending-year-card" surface="gold">
      <BoardCardHeader
        action={
          <StatusPill tone={YEAR_STATUS_TONES[yearStatus]}>
            {YEAR_STATUS_LABELS[yearStatus]}
          </StatusPill>
        }
        subtitle="Antes de que empiece, publícalo y confirma las actividades con revisión anual."
        title={`Pendientes del año ${year}`}
      />
      {pendingReviews.length === 0 ? null : (
        <ul className={pendingYearCardCalendarPage.list}>
          {pendingReviews.map((review) => {
            const { title, when } = formatPendingReview(review, defaultLocale);
            return (
              <li className={pendingYearCardCalendarPage.item} key={review.activityId}>
                <span className={pendingYearCardCalendarPage.text}>
                  <b className={pendingYearCardCalendarPage.title}>{title}</b>
                  <span className={pendingYearCardCalendarPage.when}>{when}</span>
                </span>
                {canEdit ? (
                  <ConfirmReviewButton activityId={review.activityId} year={year} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <div className={pendingYearCardCalendarPage.footer}>
        {canEdit && yearStatus === "missing" ? (
          <CreateYearButton suggestedYear={year} variant="primary" />
        ) : null}
        <BoardButton href={getChurchRoutePath("calendar", "schedule")} size="sm" variant="dark">
          Ver horarios
        </BoardButton>
      </div>
    </BoardCard>
  );
}
