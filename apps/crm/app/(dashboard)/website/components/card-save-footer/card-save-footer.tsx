import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";

const cardSaveFooterWebsitePage = {
  container: cn("mt-3.5 flex justify-end"),
};

interface CardSaveFooterProps {
  /** Nothing is rendered for a person who may only view the settings. */
  canEdit: boolean;
  saving: boolean;
  disabled?: boolean;
  onSave: () => void;
}

export function CardSaveFooter({ canEdit, saving, disabled, onSave }: CardSaveFooterProps) {
  if (!canEdit) return null;
  return (
    <div className={cardSaveFooterWebsitePage.container}>
      <BoardButton disabled={saving || disabled} onClick={onSave} variant="primary">
        {saving ? "Guardando…" : "Guardar cambios"}
      </BoardButton>
    </div>
  );
}
