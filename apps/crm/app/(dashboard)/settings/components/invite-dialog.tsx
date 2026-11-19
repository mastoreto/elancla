"use client";

import { INVITATION_ROLES, type InvitationRole } from "@ancla/contracts";
import { Mail } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { INVITATION_ROLE_LABELS } from "../data/invitation-roles";

const HTTP_CONFLICT = 409;

const inviteDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  buttonIcon: cn("size-4"),
  notice: cn(
    "rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
};

const ROLE_OPTIONS = INVITATION_ROLES.map((role) => ({
  value: role,
  label: INVITATION_ROLE_LABELS[role],
}));

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the API created the invitation and emailed the link. */
  onInvited: (email: string) => void;
}

export function InviteDialog({ open, onOpenChange, onInvited }: InviteDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {/* Remounted on each open so the fields start empty without an effect. */}
      {open ? (
        <InviteDialogForm onCancel={() => onOpenChange(false)} onInvited={onInvited} />
      ) : null}
    </Dialog>
  );
}

function InviteDialogForm({
  onCancel,
  onInvited,
}: {
  onCancel: () => void;
  onInvited: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("viewer");
  const [error, setError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  async function submit() {
    setError(undefined);
    setIsSending(true);
    const response = await apiClient.invitations.$post({ json: { email: email.trim(), role } });
    setIsSending(false);
    if (response.ok) {
      onInvited(email.trim());
      return;
    }
    if (response.status === HTTP_CONFLICT) {
      setError("Ese correo ya tiene una cuenta o una invitación pendiente.");
    } else if (response.status === 400) {
      setError("Ingresa un email válido.");
    } else {
      setError("No se pudo enviar la invitación. Inténtalo de nuevo.");
    }
  }

  return (
    <BoardDialogContent
      description="Invita a una persona a colaborar en iEkklesia."
      title="Invitar usuario"
    >
      <form
        className={inviteDialogSettingsPage.form}
        noValidate={true}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <BoardInput
          error={error}
          icon={<Mail aria-hidden="true" className={inviteDialogSettingsPage.icon} />}
          id="invite-email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="lucia@elancla.org"
          type="email"
          value={email}
        />
        <BoardSelect
          id="invite-role"
          label="Rol"
          onValueChange={(value) => setRole(value as InvitationRole)}
          options={ROLE_OPTIONS}
          value={role}
        />
        <p className={inviteDialogSettingsPage.notice}>
          Enviaremos un enlace a este correo para crear la cuenta con contraseña o con Google. Vence
          en 7 días.
        </p>
        <div className={inviteDialogSettingsPage.footer}>
          <BoardButton onClick={onCancel} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton
            disabled={isSending || email.trim() === ""}
            onClick={() => void submit()}
            variant="primary"
          >
            <Mail aria-hidden="true" className={inviteDialogSettingsPage.buttonIcon} />
            {isSending ? "Enviando..." : "Enviar invitación"}
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
