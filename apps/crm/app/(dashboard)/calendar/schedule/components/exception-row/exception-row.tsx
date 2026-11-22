"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";

const exceptionRowSchedulePage = {
  container: cn(
    "flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  date: cn("w-28 shrink-0 text-[13.5px] font-bold tabular-nums"),
  message: cn("min-w-0 flex-1 basis-56 truncate text-[15px]"),
  actions: cn("flex items-center gap-2"),
  icon: cn("size-4"),
};

interface ExceptionRowProps {
  /** Already formatted for reading. */
  date: string;
  message: string;
  /** What happens that day: "Sin reunión" or the name of the replacement set. */
  outcome: string;
  noMeeting: boolean;
  canEdit: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  testId: string;
}

/** One exception of the list: its date, message, what replaces the schedule and its actions. */
export function ExceptionRow({
  date,
  message,
  outcome,
  noMeeting,
  canEdit,
  disabled,
  onEdit,
  onDelete,
  testId,
}: ExceptionRowProps) {
  return (
    <div className={exceptionRowSchedulePage.container} data-testid={testId}>
      <span className={exceptionRowSchedulePage.date}>{date}</span>
      <span className={exceptionRowSchedulePage.message}>{message}</span>
      <StatusPill tone={noMeeting ? "rose" : "gold"}>{outcome}</StatusPill>
      {canEdit ? (
        <div className={exceptionRowSchedulePage.actions}>
          <RowIconButton label={`Editar la excepción del ${date}`} onClick={onEdit}>
            <Pencil aria-hidden="true" className={exceptionRowSchedulePage.icon} />
          </RowIconButton>
          <BoardConfirmDialog
            description="Ese día volverá a regirse por el horario que le toque."
            onConfirm={onDelete}
            title="¿Eliminar esta excepción?"
            trigger={
              <button
                aria-label={`Eliminar la excepción del ${date}`}
                className={rowIconButtonClass}
                data-testid={`${testId}-delete`}
                disabled={disabled}
                type="button"
              >
                <Trash2 aria-hidden="true" className={exceptionRowSchedulePage.icon} />
              </button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
