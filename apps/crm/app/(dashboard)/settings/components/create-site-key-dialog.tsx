"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { describeApiFailure } from "../utils";

const createSiteKeyDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  buttonIcon: cn("size-4"),
  notice: cn(
    "rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  keyBox: cn(
    "break-all rounded-[18px] bg-secondary px-4 py-3.5 font-mono text-[13px] leading-normal select-all",
  ),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
};

const LIMIT_REACHED_MESSAGE = "Ya hay 2 claves activas. Revoca una antes de crear otra.";
const COPY_RESET_MS = 2000;

interface CreateSiteKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the key was created and the dialog is closed, to refresh the list. */
  onFinished: () => void;
}

export function CreateSiteKeyDialog({ open, onOpenChange, onFinished }: CreateSiteKeyDialogProps) {
  function close() {
    onOpenChange(false);
    onFinished();
  }

  return (
    <Dialog onOpenChange={(next) => (next ? onOpenChange(true) : close())} open={open}>
      {/* Remounted on each open so the form starts empty and a shown key is never kept around. */}
      {open ? <CreateSiteKeyDialogForm onClose={close} /> : null}
    </Dialog>
  );
}

function CreateSiteKeyDialogForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit() {
    setError(undefined);
    setIsSending(true);
    const response = await apiClient["site-keys"].$post({ json: { name: name.trim() } });
    setIsSending(false);
    if (response.ok) {
      setCreatedKey((await response.json()).key);
      return;
    }
    setError(describeApiFailure(response.status, LIMIT_REACHED_MESSAGE));
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      toast.error("No se pudo copiar. Selecciónala y cópiala a mano.");
    }
  }

  if (createdKey) {
    return (
      <BoardDialogContent
        description="Cópiala ahora y pégala en SITE_API_KEY del sitio. No se vuelve a mostrar."
        title="Clave creada"
      >
        <div className={createSiteKeyDialogSettingsPage.form}>
          <code className={createSiteKeyDialogSettingsPage.keyBox}>{createdKey}</code>
          <p className={createSiteKeyDialogSettingsPage.notice}>
            Guárdala en un lugar seguro. Si la pierdes, crea una nueva y revoca esta.
          </p>
          <div className={createSiteKeyDialogSettingsPage.footer}>
            <BoardButton onClick={() => void copyKey(createdKey)} variant="ghost">
              {copied ? (
                <Check aria-hidden="true" className={createSiteKeyDialogSettingsPage.buttonIcon} />
              ) : (
                <Copy aria-hidden="true" className={createSiteKeyDialogSettingsPage.buttonIcon} />
              )}
              {copied ? "Copiada" : "Copiar"}
            </BoardButton>
            <BoardButton onClick={onClose} variant="primary">
              Listo
            </BoardButton>
          </div>
        </div>
      </BoardDialogContent>
    );
  }

  return (
    <BoardDialogContent
      description="Es la credencial con la que el sitio público lee el contenido de la iglesia."
      title="Crear clave del sitio"
    >
      <form
        className={createSiteKeyDialogSettingsPage.form}
        noValidate={true}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <BoardInput
          error={error}
          icon={<KeyRound aria-hidden="true" className={createSiteKeyDialogSettingsPage.icon} />}
          id="site-key-name"
          label="Nombre"
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sitio web de producción"
          value={name}
        />
        <p className={createSiteKeyDialogSettingsPage.notice}>
          Solo lectura: no puede modificar nada. Puede haber 2 claves activas a la vez, para rotarla
          sin cortes.
        </p>
        <div className={createSiteKeyDialogSettingsPage.footer}>
          <BoardButton onClick={onClose} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton
            disabled={isSending || name.trim() === ""}
            onClick={() => void submit()}
            variant="primary"
          >
            <KeyRound aria-hidden="true" className={createSiteKeyDialogSettingsPage.buttonIcon} />
            {isSending ? "Creando..." : "Crear clave"}
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
