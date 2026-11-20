"use client";

import type { MinistryDto, RoleDto } from "@ancla/contracts";
import { Mail } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { cn } from "@/lib/utils";
import { OptionChecklist } from "./option-checklist";

const inviteDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  buttonIcon: cn("size-4"),
  notice: cn(
    "rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
};

interface InviteDialogProps {
  /** Roles the invited person will get; `null` when the caller cannot list them. */
  roles: RoleDto[] | null;
  ministries: MinistryDto[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the API created the invitation and emailed the link. */
  onInvited: (email: string) => void;
}

export function InviteDialog({
  roles,
  ministries,
  open,
  onOpenChange,
  onInvited,
}: InviteDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {/* Remounted on each open so the fields start empty without an effect. */}
      {open ? (
        <InviteDialogForm
          ministries={ministries}
          onCancel={() => onOpenChange(false)}
          onInvited={onInvited}
          roles={roles}
        />
      ) : null}
    </Dialog>
  );
}

function InviteDialogForm({
  roles,
  ministries,
  onCancel,
  onInvited,
}: {
  roles: RoleDto[] | null;
  ministries: MinistryDto[] | null;
  onCancel: () => void;
  onInvited: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [ministryIds, setMinistryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  async function submit() {
    setError(undefined);
    setIsSending(true);
    const response = await apiClient.invitations.$post({
      json: { email: email.trim(), roleIds, ministryIds },
    });
    setIsSending(false);
    if (response.ok) {
      onInvited(email.trim());
      return;
    }
    setError(
      describeApiFailure(
        response.status,
        "Ese correo ya tiene una cuenta o una invitación pendiente.",
      ),
    );
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
        <OptionChecklist
          disabled={roles === null}
          emptyText="No tienes permiso para ver los roles."
          legend="Roles"
          onChange={setRoleIds}
          options={(roles ?? []).map((role) => ({
            value: role.id,
            label: role.name,
            hint: role.description || undefined,
          }))}
          selected={roleIds}
        />
        <OptionChecklist
          disabled={ministries === null}
          emptyText="No hay ministerios para asignar."
          legend="Ministerios (opcional)"
          onChange={setMinistryIds}
          options={(ministries ?? []).map((ministry) => ({
            value: ministry.id,
            label: ministry.name,
          }))}
          selected={ministryIds}
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
            disabled={isSending || email.trim() === "" || roleIds.length === 0}
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
