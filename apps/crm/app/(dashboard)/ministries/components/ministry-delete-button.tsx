"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";

interface MinistryDeleteButtonProps {
  ministryName: string;
}

export function MinistryDeleteButton({ ministryName }: MinistryDeleteButtonProps) {
  const router = useRouter();

  return (
    <ConfirmDeleteDialog
      onConfirm={() => router.push(getChurchRoutePath("ministries"))}
      title="¿Eliminar este ministerio?"
      trigger={
        <Button type="button" variant="outline">
          <Trash2 aria-hidden="true" />
          Eliminar
        </Button>
      }
    >
      <p>
        Vas a eliminar <strong>{ministryName}</strong>. Dejará de mostrarse en el sitio web y su
        presupuesto quedará sin asignar. No se puede deshacer.
      </p>
    </ConfirmDeleteDialog>
  );
}
