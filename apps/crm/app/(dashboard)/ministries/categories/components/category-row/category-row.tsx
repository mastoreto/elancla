"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { cn } from "@/lib/utils";

const categoryRowMinistriesPage = {
  container: cn(
    "flex items-center gap-3 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  text: cn("flex min-w-0 flex-1 flex-col"),
  name: cn("truncate text-[15px] font-bold"),
  detail: cn("truncate text-[13px] text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

interface CategoryRowProps {
  name: string;
  detail: string;
  /** Prefix of the test ids of the row and its actions. */
  testId: string;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** One category of the list: its name, its order and the actions to edit or delete it. */
export function CategoryRow({
  name,
  detail,
  testId,
  disabled,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  return (
    <div className={categoryRowMinistriesPage.container} data-testid={testId}>
      <div className={categoryRowMinistriesPage.text}>
        <span className={categoryRowMinistriesPage.name}>{name}</span>
        <span className={categoryRowMinistriesPage.detail}>{detail}</span>
      </div>
      <RowIconButton label={`Editar ${name}`} onClick={onEdit}>
        <Pencil aria-hidden="true" className={categoryRowMinistriesPage.icon} />
      </RowIconButton>
      <BoardConfirmDialog
        description="Dejará de estar disponible para los ministerios. Una categoría que algún ministerio usa no se puede borrar."
        onConfirm={onDelete}
        title="¿Eliminar esta categoría?"
        trigger={
          <button
            aria-label={`Eliminar ${name}`}
            className={rowIconButtonClass}
            data-testid={`${testId}-delete`}
            disabled={disabled}
            type="button"
          >
            <Trash2 aria-hidden="true" className={categoryRowMinistriesPage.icon} />
          </button>
        }
      />
    </div>
  );
}
