"use client";

import { MINISTRY_NAME_MAX_LENGTH } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { apiClient } from "@/lib/api/apiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { describeMinistryFailure } from "../../lib/describeMinistryFailure";

const newMinistryButtonMinistriesPage = {
  form: cn("flex w-full flex-wrap items-end gap-3"),
  field: cn("min-w-60 flex-1"),
  icon: cn("size-4"),
};

/** Asks for the internal name, creates the empty ministry and opens it for its profile. */
export function NewMinistryButton() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(): Promise<void> {
    const trimmed = name.trim();
    if (trimmed === "") {
      toast.error("Escribe el nombre del ministerio.");
      return;
    }
    setBusy(true);
    try {
      const response = await apiClient.content.ministries.$post({ json: { name: trimmed } });
      if (!response.ok) {
        toast.error(await describeMinistryFailure(response));
        return;
      }
      const { id } = await response.json();
      router.push(getChurchRoutePath("ministries", id));
    } catch {
      toast.error("No se pudo crear el ministerio. Revisa tu conexión.");
    } finally {
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <BoardButton
        data-testid="new-ministry-button"
        onClick={() => setAsking(true)}
        variant="primary"
      >
        <Plus aria-hidden="true" className={newMinistryButtonMinistriesPage.icon} />
        Nuevo ministerio
      </BoardButton>
    );
  }

  return (
    <div className={newMinistryButtonMinistriesPage.form}>
      <div className={newMinistryButtonMinistriesPage.field}>
        <BoardInput
          autoFocus={true}
          data-testid="new-ministry-name"
          hint="Nombre interno: lo usan usuarios e invitaciones. El nombre público se escribe después."
          id="new-ministry-name"
          label="Nombre del ministerio"
          maxLength={MINISTRY_NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
      </div>
      <BoardButton disabled={busy} onClick={() => setAsking(false)} variant="ghost">
        Cancelar
      </BoardButton>
      <BoardButton
        data-testid="new-ministry-create"
        disabled={busy}
        onClick={() => void create()}
        variant="primary"
      >
        {busy ? "Creando…" : "Crear ministerio"}
      </BoardButton>
    </div>
  );
}
