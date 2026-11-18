"use client";

import { useRouter } from "next/navigation";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

interface InventoryDeleteDialogProps {
  itemName: string;
  itemCode: string;
  trigger: React.ReactNode;
}

const inventoryDeleteDialogInventoryPage = {
  strong: cn("text-foreground"),
};

/** Delete confirmation with "Dar de baja" as the safer alternative. */
export function InventoryDeleteDialog({ itemName, itemCode, trigger }: InventoryDeleteDialogProps) {
  const router = useRouter();
  // Seed-data screen: both outcomes return to the list.
  const goToList = () => router.push(getChurchRoutePath("inventory"));

  return (
    <BoardConfirmDialog
      alternative={{ label: "Dar de baja", onSelect: goToList }}
      description={
        <>
          Vas a eliminar <b className={inventoryDeleteDialogInventoryPage.strong}>{itemName}</b> (
          {itemCode}) y su historial. No se puede deshacer.
        </>
      }
      notice={
        <>
          Si solo salió de uso, mejor{" "}
          <b className={inventoryDeleteDialogInventoryPage.strong}>dalo de baja</b>: queda
          registrado pero deja de contarse.
        </>
      }
      onConfirm={goToList}
      title="¿Eliminar este ítem?"
      trigger={trigger}
    />
  );
}
