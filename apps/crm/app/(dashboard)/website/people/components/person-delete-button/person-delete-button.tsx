import { Trash2 } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { cn } from "@/lib/utils";

const personDeleteButtonWebsitePage = {
  name: cn("text-foreground"),
  icon: cn("size-4"),
};

interface PersonDeleteButtonProps {
  personName: string;
  disabled: boolean;
  onConfirm: () => void;
}

export function PersonDeleteButton({ personName, disabled, onConfirm }: PersonDeleteButtonProps) {
  return (
    <BoardConfirmDialog
      description={
        <>
          Vas a eliminar a <b className={personDeleteButtonWebsitePage.name}>{personName}</b>.
          Dejará de aparecer en el sitio en todos sus roles.
        </>
      }
      onConfirm={onConfirm}
      title="¿Eliminar esta persona?"
      trigger={
        <BoardButton disabled={disabled} variant="outline">
          <Trash2 aria-hidden="true" className={personDeleteButtonWebsitePage.icon} />
          Eliminar
        </BoardButton>
      }
    />
  );
}
