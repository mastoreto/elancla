"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";

interface InventoryDeleteButtonProps {
  itemName: string;
}

export function InventoryDeleteButton({ itemName }: InventoryDeleteButtonProps) {
  const router = useRouter();
  const goToList = () => router.push(getChurchRoutePath("inventory"));

  return (
    <ConfirmDeleteDialog
      alternative={{ label: "Dar de baja", onSelect: goToList }}
      onConfirm={goToList}
      title="¿Eliminar este ítem?"
      trigger={
        <Button type="button" variant="outline">
          <Trash2 aria-hidden="true" />
          Eliminar
        </Button>
      }
    >
      <p>
        Vas a eliminar <strong>{itemName}</strong> junto con su historial. Si solo salió de uso,
        mejor dalo de baja: se conserva el registro. Eliminar no se puede deshacer.
      </p>
    </ConfirmDeleteDialog>
  );
}
