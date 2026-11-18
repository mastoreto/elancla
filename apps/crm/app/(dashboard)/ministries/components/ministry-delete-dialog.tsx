"use client";

import { useRouter } from "next/navigation";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

interface MinistryDeleteDialogProps {
  ministryName: string;
  trigger: React.ReactNode;
}

const ministryDeleteDialogMinistriesPage = {
  strong: cn("text-foreground"),
};

// The linked projects and movements come from the board; they are not modelled yet.
const LINKED_PROJECTS = 3;
const LINKED_MOVEMENTS = 12;

export function MinistryDeleteDialog({ ministryName, trigger }: MinistryDeleteDialogProps) {
  const router = useRouter();

  return (
    <BoardConfirmDialog
      description={
        <>
          Vas a eliminar <b className={ministryDeleteDialogMinistriesPage.strong}>{ministryName}</b>
          . Sus movimientos y proyectos quedarán sin ministerio asignado.
        </>
      }
      notice={
        <>
          Tiene{" "}
          <b className={ministryDeleteDialogMinistriesPage.strong}>{LINKED_PROJECTS} proyectos</b> y{" "}
          <b className={ministryDeleteDialogMinistriesPage.strong}>
            {LINKED_MOVEMENTS} movimientos
          </b>{" "}
          asociados.
        </>
      }
      onConfirm={() => router.push(getChurchRoutePath("ministries"))}
      title="¿Eliminar este ministerio?"
      trigger={trigger}
    />
  );
}
