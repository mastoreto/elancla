"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import type { MinistryOption } from "../../types";
import type { ActivityBadge } from "../../utils/activityBadges";
import { MinistryDots } from "../ministry-dots";

const activityRowSchedulePage = {
  container: cn(
    "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  time: cn("w-28 shrink-0 text-[13.5px] font-bold tabular-nums"),
  main: cn("flex min-w-0 flex-1 basis-56 flex-col gap-1"),
  title: cn("truncate text-[15px] font-bold"),
  meta: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  pills: cn("flex flex-wrap items-center gap-1.5"),
  actions: cn("flex items-center gap-2"),
  icon: cn("size-4"),
};

/** The yearly confirmation of a fixed activity; `available` is false while the year does not exist. */
export interface ActivityReviewAction {
  year: number;
  available: boolean;
  onConfirm: () => void;
}

interface ActivityRowProps {
  title: string;
  timeRange: string;
  placeName: string | null;
  ministries: readonly MinistryOption[];
  badges: readonly ActivityBadge[];
  review: ActivityReviewAction | null;
  canEdit: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  testId: string;
}

/** One activity of the selected set: time, title, place, ministries, pills and its actions. */
export function ActivityRow({
  title,
  timeRange,
  placeName,
  ministries,
  badges,
  review,
  canEdit,
  disabled,
  onEdit,
  onDelete,
  testId,
}: ActivityRowProps) {
  return (
    <div className={activityRowSchedulePage.container} data-testid={testId}>
      <span className={activityRowSchedulePage.time}>{timeRange}</span>
      <div className={activityRowSchedulePage.main}>
        <span className={activityRowSchedulePage.title}>{title}</span>
        {placeName ? <span className={activityRowSchedulePage.meta}>{placeName}</span> : null}
        <MinistryDots ministries={ministries} />
        <span className={activityRowSchedulePage.pills}>
          {badges.map((badge) => (
            <StatusPill key={badge.label} tone={badge.tone}>
              {badge.label}
            </StatusPill>
          ))}
        </span>
        {canEdit && review ? (
          review.available ? (
            <BoardButton disabled={disabled} onClick={review.onConfirm} size="sm" variant="soft">
              Confirmar revisión del {review.year}
            </BoardButton>
          ) : (
            <span className={activityRowSchedulePage.meta}>
              Crea el año {review.year} en el calendario para confirmar su revisión.
            </span>
          )
        ) : null}
      </div>
      {canEdit ? (
        <div className={activityRowSchedulePage.actions}>
          <RowIconButton label={`Editar ${title}`} onClick={onEdit}>
            <Pencil aria-hidden="true" className={activityRowSchedulePage.icon} />
          </RowIconButton>
          <BoardConfirmDialog
            description="La actividad dejará de salir en el calendario y en los horarios del sitio."
            onConfirm={onDelete}
            title="¿Eliminar esta actividad?"
            trigger={
              <button
                aria-label={`Eliminar ${title}`}
                className={rowIconButtonClass}
                data-testid={`${testId}-delete`}
                disabled={disabled}
                type="button"
              >
                <Trash2 aria-hidden="true" className={activityRowSchedulePage.icon} />
              </button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
