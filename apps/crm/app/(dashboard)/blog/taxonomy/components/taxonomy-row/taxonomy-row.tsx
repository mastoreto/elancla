"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { cn } from "@/lib/utils";

const taxonomyRowBlogPage = {
  container: cn(
    "flex items-center gap-3 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  text: cn("flex min-w-0 flex-1 flex-col"),
  name: cn("truncate text-[15px] font-bold"),
  detail: cn("truncate text-[13px] text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

interface TaxonomyRowProps {
  name: string;
  detail: string;
  /** Prefix of the test ids of the row and its actions. */
  testId: string;
  /** What the delete dialog says about the consequences. */
  deleteDescription: string;
  deleteTitle: string;
  canEdit: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** One category or series of a list: its name, its slug and the actions the user may take. */
export function TaxonomyRow({
  name,
  detail,
  testId,
  deleteDescription,
  deleteTitle,
  canEdit,
  disabled,
  onEdit,
  onDelete,
}: TaxonomyRowProps) {
  return (
    <div className={taxonomyRowBlogPage.container} data-testid={testId}>
      <div className={taxonomyRowBlogPage.text}>
        <span className={taxonomyRowBlogPage.name}>{name}</span>
        <span className={taxonomyRowBlogPage.detail}>{detail}</span>
      </div>
      {canEdit ? (
        <>
          <RowIconButton label={`Editar ${name}`} onClick={onEdit}>
            <Pencil aria-hidden="true" className={taxonomyRowBlogPage.icon} />
          </RowIconButton>
          <BoardConfirmDialog
            description={deleteDescription}
            onConfirm={onDelete}
            title={deleteTitle}
            trigger={
              <button
                aria-label={`Eliminar ${name}`}
                className={rowIconButtonClass}
                data-testid={`${testId}-delete`}
                disabled={disabled}
                type="button"
              >
                <Trash2 aria-hidden="true" className={taxonomyRowBlogPage.icon} />
              </button>
            }
          />
        </>
      ) : null}
    </div>
  );
}
