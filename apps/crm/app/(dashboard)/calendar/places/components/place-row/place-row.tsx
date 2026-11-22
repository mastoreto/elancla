"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { cn } from "@/lib/utils";

const placeRowCalendarPlacesPage = {
  container: cn(
    "flex items-center gap-3 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  text: cn("flex min-w-0 flex-1 flex-col"),
  name: cn("truncate text-[15px] font-bold"),
  detail: cn("truncate text-[13px] text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

interface PlaceRowProps {
  name: string;
  address: string | null;
  mapsUrl: string | null;
  /** Without permission to edit the row is read-only: no edit or delete. */
  canEdit: boolean;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  testId: string;
}

/** One place of the list: its name, address, map link and the actions to edit or delete it. */
export function PlaceRow({
  name,
  address,
  mapsUrl,
  canEdit,
  disabled,
  onEdit,
  onDelete,
  testId,
}: PlaceRowProps) {
  return (
    <div className={placeRowCalendarPlacesPage.container} data-testid={testId}>
      <div className={placeRowCalendarPlacesPage.text}>
        <span className={placeRowCalendarPlacesPage.name}>{name}</span>
        {address ? <span className={placeRowCalendarPlacesPage.detail}>{address}</span> : null}
      </div>
      {mapsUrl ? (
        <a
          aria-label={`Abrir el mapa de ${name}`}
          className={rowIconButtonClass}
          href={mapsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" className={placeRowCalendarPlacesPage.icon} />
        </a>
      ) : null}
      {canEdit ? (
        <>
          <RowIconButton label={`Editar ${name}`} onClick={onEdit}>
            <Pencil aria-hidden="true" className={placeRowCalendarPlacesPage.icon} />
          </RowIconButton>
          <BoardConfirmDialog
            description="Un horario o un evento que use este lugar impide borrarlo: muévelo a otro primero."
            onConfirm={onDelete}
            title="¿Eliminar este lugar?"
            trigger={
              <button
                aria-label={`Eliminar ${name}`}
                className={rowIconButtonClass}
                data-testid={`${testId}-delete`}
                disabled={disabled}
                type="button"
              >
                <Trash2 aria-hidden="true" className={placeRowCalendarPlacesPage.icon} />
              </button>
            }
          />
        </>
      ) : null}
    </div>
  );
}
