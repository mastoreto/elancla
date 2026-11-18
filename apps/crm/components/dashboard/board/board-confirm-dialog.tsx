"use client";

import { Info, Trash2 } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BoardButton } from "./board-button";
import { IconBubble } from "./icon-bubble";

const boardConfirmDialogDashboardPage = {
  content: cn(
    "gap-4 rounded-[30px] border-0 bg-card p-[30px] sm:max-w-[500px]",
    "shadow-[0_30px_60px_-30px_rgba(60,20,30,0.45)]",
  ),
  header: cn("flex items-center gap-3.5"),
  bubble: cn("size-[52px]"),
  bubbleIcon: cn("size-6"),
  title: cn("font-display text-[26px] leading-[1.15] font-semibold"),
  text: cn("text-[14.5px] leading-[1.6] text-[var(--tinta-suave)]"),
  notice: cn(
    "flex items-start gap-2.5 rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  noticeIcon: cn("mt-0.5 size-4 shrink-0"),
  footer: cn("flex flex-wrap justify-end gap-2.5"),
  icon: cn("size-4"),
};

interface BoardConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  /** Gold callout under the text, e.g. the "dar de baja" suggestion. */
  notice?: React.ReactNode;
  trigger: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  /** Safer alternative shown between "Cancelar" and the destructive action. */
  alternative?: { label: string; onSelect: () => void };
}

/** Destructive confirmation modal that follows the board's delete dialogs. */
export function BoardConfirmDialog({
  title,
  description,
  notice,
  trigger,
  confirmLabel = "Eliminar",
  onConfirm,
  alternative,
}: BoardConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild={true}>{trigger}</DialogTrigger>
      <DialogContent className={boardConfirmDialogDashboardPage.content} showCloseButton={false}>
        <div className={boardConfirmDialogDashboardPage.header}>
          <IconBubble className={boardConfirmDialogDashboardPage.bubble} tone="rose">
            <Trash2 aria-hidden="true" className={boardConfirmDialogDashboardPage.bubbleIcon} />
          </IconBubble>
          <DialogTitle className={boardConfirmDialogDashboardPage.title}>{title}</DialogTitle>
        </div>
        <DialogDescription className={boardConfirmDialogDashboardPage.text}>
          {description}
        </DialogDescription>
        {notice ? (
          <div className={boardConfirmDialogDashboardPage.notice}>
            <Info aria-hidden="true" className={boardConfirmDialogDashboardPage.noticeIcon} />
            <span>{notice}</span>
          </div>
        ) : null}
        <div className={boardConfirmDialogDashboardPage.footer}>
          <DialogClose asChild={true}>
            <BoardButton variant="ghost">Cancelar</BoardButton>
          </DialogClose>
          {alternative ? (
            <BoardButton onClick={run(alternative.onSelect)} variant="outline">
              {alternative.label}
            </BoardButton>
          ) : null}
          <BoardButton onClick={run(onConfirm)} variant="primary">
            <Trash2 aria-hidden="true" className={boardConfirmDialogDashboardPage.icon} />
            {confirmLabel}
          </BoardButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
