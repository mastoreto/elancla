"use client";

import { Info, Trash2, UsersRound } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const assemblyTakedownDialogAssemblyPage = {
  content: cn(
    "gap-4 rounded-[30px] border-0 bg-card p-[30px] sm:max-w-[500px]",
    "shadow-[0_30px_60px_-30px_rgba(60,20,30,0.45)]",
  ),
  header: cn("flex items-center gap-3.5"),
  bubble: cn("size-[52px]"),
  bubbleIcon: cn("size-6"),
  title: cn("font-display text-[26px] leading-[1.15] font-semibold"),
  text: cn("text-[14.5px] leading-[1.6] text-[var(--tinta-suave)]"),
  strong: cn("font-bold text-foreground"),
  notice: cn(
    "flex items-start gap-2.5 rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  noticeIcon: cn("mt-0.5 size-4 shrink-0"),
  footer: cn("flex flex-wrap justify-end gap-2.5"),
  icon: cn("size-4"),
};

interface AssemblyTakedownDialogProps {
  code: string;
  connected: number;
  trigger: React.ReactNode;
  onConfirm: () => void;
}

/** Permanent take-down: the code has to be typed to confirm. */
export function AssemblyTakedownDialog({
  code,
  connected,
  trigger,
  onConfirm,
}: AssemblyTakedownDialogProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toUpperCase() === code;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setTyped("");
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild={true}>{trigger}</DialogTrigger>
      <DialogContent className={assemblyTakedownDialogAssemblyPage.content} showCloseButton={false}>
        <div className={assemblyTakedownDialogAssemblyPage.header}>
          <IconBubble className={assemblyTakedownDialogAssemblyPage.bubble} tone="rose">
            <Trash2 aria-hidden="true" className={assemblyTakedownDialogAssemblyPage.bubbleIcon} />
          </IconBubble>
          <DialogTitle className={assemblyTakedownDialogAssemblyPage.title}>
            ¿Dar de baja este informe?
          </DialogTitle>
        </div>
        <DialogDescription className={assemblyTakedownDialogAssemblyPage.text}>
          Quienes tengan el código {code} o escaneen el QR verán que el informe{" "}
          <b className={assemblyTakedownDialogAssemblyPage.strong}>ya no está disponible</b>. Esta
          acción no se puede deshacer; si necesitas volver a mostrarlo, crea una nueva publicación.
        </DialogDescription>
        {connected > 0 ? (
          <div className={assemblyTakedownDialogAssemblyPage.notice}>
            <UsersRound
              aria-hidden="true"
              className={assemblyTakedownDialogAssemblyPage.noticeIcon}
            />
            <span>{connected} personas conectadas perderán el acceso de inmediato.</span>
          </div>
        ) : (
          <div className={assemblyTakedownDialogAssemblyPage.notice}>
            <Info aria-hidden="true" className={assemblyTakedownDialogAssemblyPage.noticeIcon} />
            <span>Nadie está conectado en este momento.</span>
          </div>
        )}
        <BoardInput
          id="takedown-code"
          label="Escribe el código para confirmar"
          onChange={(event) => setTyped(event.target.value)}
          placeholder={code}
          value={typed}
        />
        <div className={assemblyTakedownDialogAssemblyPage.footer}>
          <DialogClose asChild={true}>
            <BoardButton variant="ghost">Cancelar</BoardButton>
          </DialogClose>
          <BoardButton
            disabled={!matches}
            onClick={() => {
              handleOpenChange(false);
              onConfirm();
            }}
            variant="primary"
          >
            <Trash2 aria-hidden="true" className={assemblyTakedownDialogAssemblyPage.icon} />
            Dar de baja
          </BoardButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
