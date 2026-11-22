"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { BoardSwitchRow } from "@/components/dashboard/board/board-form";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";

const scheduleSetCardSchedulePage = {
  container: cn(
    "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  selected: cn("bg-[var(--oro-50)]"),
  main: cn("flex min-w-0 flex-1 basis-56 flex-col gap-1"),
  name: cn("truncate text-[15px] font-bold"),
  meta: cn("flex flex-wrap items-center gap-1.5 text-[12.5px] text-[var(--tinta-apagada)]"),
  actions: cn("flex items-center gap-2"),
  icon: cn("size-4"),
};

interface ScheduleSetCardProps {
  name: string;
  validity: string;
  isDefault: boolean;
  forcedActive: boolean;
  /** The set whose activities are listed below. */
  selected: boolean;
  /** Link that selects this set. */
  href: string;
  /** Without permission to edit the set is read-only: no switch and no actions. */
  canEdit: boolean;
  disabled: boolean;
  onToggleForced: (forcedActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  testId: string;
}

/** One schedule set of the list: validity, flags, the manual switch and the actions. */
export function ScheduleSetCard({
  name,
  validity,
  isDefault,
  forcedActive,
  selected,
  href,
  canEdit,
  disabled,
  onToggleForced,
  onEdit,
  onDelete,
  testId,
}: ScheduleSetCardProps) {
  return (
    <div
      className={cn(
        scheduleSetCardSchedulePage.container,
        selected && scheduleSetCardSchedulePage.selected,
      )}
      data-testid={testId}
    >
      <Link
        aria-current={selected ? "true" : undefined}
        className={scheduleSetCardSchedulePage.main}
        href={href}
      >
        <span className={scheduleSetCardSchedulePage.name}>{name}</span>
        <span className={scheduleSetCardSchedulePage.meta}>
          {validity}
          {isDefault ? <StatusPill tone="gold">Predeterminado</StatusPill> : null}
          {forcedActive ? <StatusPill tone="rose">Forzado</StatusPill> : null}
        </span>
      </Link>
      {canEdit ? (
        <div className={scheduleSetCardSchedulePage.actions}>
          <BoardSwitchRow
            checked={forcedActive}
            disabled={disabled}
            onCheckedChange={onToggleForced}
            title="Forzar este horario"
          />
          <RowIconButton label={`Editar ${name}`} onClick={onEdit}>
            <Pencil aria-hidden="true" className={scheduleSetCardSchedulePage.icon} />
          </RowIconButton>
          <BoardConfirmDialog
            description="Se borran también sus actividades. Si una excepción lo usa como reemplazo no se puede borrar."
            onConfirm={onDelete}
            title="¿Eliminar este horario?"
            trigger={
              <button
                aria-label={`Eliminar ${name}`}
                className={rowIconButtonClass}
                data-testid={`${testId}-delete`}
                disabled={disabled}
                type="button"
              >
                <Trash2 aria-hidden="true" className={scheduleSetCardSchedulePage.icon} />
              </button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
