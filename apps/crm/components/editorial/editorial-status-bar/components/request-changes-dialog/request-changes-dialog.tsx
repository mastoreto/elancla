"use client";

import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const requestChangesDialogEditorialPage = {
  form: cn("flex flex-col gap-4"),
  footer: cn("flex flex-wrap justify-end gap-2.5"),
};

interface RequestChangesDialogProps {
  open: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment: string) => void;
}

/** Asks the reviewer what must change: the author reads it in the email and in the status. */
export function RequestChangesDialog({
  open,
  busy,
  onOpenChange,
  onSubmit,
}: RequestChangesDialogProps) {
  const [comment, setComment] = useState("");
  const trimmed = comment.trim();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <BoardDialogContent
        description="La persona que lo escribió recibirá tu comentario por correo."
        title="Pedir cambios"
      >
        <form
          className={requestChangesDialogEditorialPage.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed) onSubmit(trimmed);
          }}
        >
          <Textarea
            aria-label="Comentario"
            maxLength={2000}
            onChange={(event) => setComment(event.target.value)}
            placeholder="¿Qué hay que corregir?"
            required={true}
            rows={5}
            value={comment}
          />
          <div className={requestChangesDialogEditorialPage.footer}>
            <BoardButton onClick={() => onOpenChange(false)} variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton disabled={busy || !trimmed} type="submit" variant="primary">
              Pedir cambios
            </BoardButton>
          </div>
        </form>
      </BoardDialogContent>
    </Dialog>
  );
}
