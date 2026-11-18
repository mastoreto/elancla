import { Check } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardFormFooter } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";

const contentFormActionsDashboardPage = {
  icon: cn("size-4"),
};

interface ContentFormActionsProps {
  cancelHref: string;
  /** "Publicar sermón", "Publicar episodio"… */
  publishLabel: string;
  onSaveDraft: () => void;
  onPublish: () => void;
}

/** Cancelar · Guardar borrador · Publicar, as the content form boards end. */
export function ContentFormActions({
  cancelHref,
  publishLabel,
  onSaveDraft,
  onPublish,
}: ContentFormActionsProps) {
  return (
    <BoardFormFooter>
      <BoardButton href={cancelHref} variant="ghost">
        Cancelar
      </BoardButton>
      <BoardButton onClick={onSaveDraft}>Guardar borrador</BoardButton>
      <BoardButton onClick={onPublish} variant="primary">
        <Check aria-hidden="true" className={contentFormActionsDashboardPage.icon} />
        {publishLabel}
      </BoardButton>
    </BoardFormFooter>
  );
}
