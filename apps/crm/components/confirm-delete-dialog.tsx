"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDeleteDialogProps {
  title: string;
  /** Trigger element, rendered with `asChild`. */
  trigger: ReactNode;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  /** Optional safer alternative shown next to the destructive action (e.g. "Dar de baja"). */
  alternative?: { label: string; onSelect: () => void };
}

const confirmDeleteDialogSharedPage = {
  confirm: cn("bg-destructive text-white hover:bg-destructive/90"),
};

export function ConfirmDeleteDialog({
  title,
  trigger,
  children,
  confirmLabel = "Eliminar",
  onConfirm,
  alternative,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={true}>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild={true}>
            <div>{children}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {alternative ? (
            <AlertDialogAction onClick={alternative.onSelect}>
              {alternative.label}
            </AlertDialogAction>
          ) : null}
          <AlertDialogAction className={confirmDeleteDialogSharedPage.confirm} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
