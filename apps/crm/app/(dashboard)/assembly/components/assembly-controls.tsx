"use client";

import { DoorClosed, DoorOpen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import type { AssemblyReportStatus } from "../types";
import { AssemblyStatusBadge } from "./assembly-status-badge";

interface AssemblyControlsProps {
  reportTitle: string;
  initialStatus: AssemblyReportStatus;
}

// Open/close is local state until the Assembly API exists.
export function AssemblyControls({ reportTitle, initialStatus }: AssemblyControlsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AssemblyReportStatus>(initialStatus);
  const isOpen = status === "Abierto";
  const canToggle = status === "Abierto" || status === "Sin habilitar" || status === "Programado";
  const goToList = () => router.push(getChurchRoutePath("assembly"));

  return (
    <>
      <AssemblyStatusBadge status={status} />
      {canToggle ? (
        <Button
          onClick={() => setStatus(isOpen ? "Vencido" : "Abierto")}
          type="button"
          variant="outline"
        >
          {isOpen ? <DoorClosed aria-hidden="true" /> : <DoorOpen aria-hidden="true" />}
          {isOpen ? "Cerrar acceso" : "Habilitar ahora"}
        </Button>
      ) : null}
      {status === "Dado de baja" ? null : (
        <ConfirmDeleteDialog
          confirmLabel="Dar de baja"
          onConfirm={() => {
            setStatus("Dado de baja");
            goToList();
          }}
          title="¿Dar de baja este informe?"
          trigger={
            <Button type="button" variant="outline">
              <Trash2 aria-hidden="true" />
              Dar de baja
            </Button>
          }
        >
          <p>
            <strong>{reportTitle}</strong> dejará de estar disponible para los asistentes aunque el
            código siga vigente. No se puede deshacer.
          </p>
        </ConfirmDeleteDialog>
      )}
    </>
  );
}
