"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ROLE_PROFILE_LABELS } from "../data/roles";
import { type UserInviteErrors, type UserInviteValues, userInviteSchema } from "../schema";
import type { SettingsSelectOption, SettingsUser } from "../types";

const EMPTY_VALUES: UserInviteValues = { name: "", email: "", role: "", ministry: "" };

const userDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  pair: cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  buttonIcon: cn("size-4"),
  notice: cn(
    "rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
};

const ROLE_OPTIONS: SettingsSelectOption[] = Object.entries(ROLE_PROFILE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

interface UserDialogProps {
  open: boolean;
  /** User being edited; `null` opens the invitation form. */
  user: SettingsUser | null;
  ministryOptions: SettingsSelectOption[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserInviteValues) => void;
}

export function UserDialog({
  open,
  user,
  ministryOptions,
  onOpenChange,
  onSubmit,
}: UserDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {/* Remounting per target resets the fields without an effect. */}
      <UserDialogForm
        key={user?.id ?? "new"}
        ministryOptions={ministryOptions}
        onCancel={() => onOpenChange(false)}
        onSubmit={onSubmit}
        user={user}
      />
    </Dialog>
  );
}

interface UserDialogFormProps {
  user: SettingsUser | null;
  ministryOptions: SettingsSelectOption[];
  onCancel: () => void;
  onSubmit: (values: UserInviteValues) => void;
}

function UserDialogForm({ user, ministryOptions, onCancel, onSubmit }: UserDialogFormProps) {
  const isEdit = user !== null;
  const [values, setValues] = useState<UserInviteValues>(
    user ? { name: user.name, email: user.email, role: user.role, ministry: "" } : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<UserInviteErrors>({});

  const update = (field: keyof UserInviteValues, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const submit = () => {
    const result = userInviteSchema.safeParse(values);
    if (!result.success) {
      const next: UserInviteErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof UserInviteErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    onSubmit(result.data);
  };

  return (
    <BoardDialogContent
      description={
        isEdit
          ? "Actualiza el rol y los datos de esta persona."
          : "Invita a una persona a colaborar en iEkklesia."
      }
      title={isEdit ? "Editar usuario" : "Crear usuario"}
    >
      <form
        className={userDialogSettingsPage.form}
        noValidate={true}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <BoardInput
          error={errors.name}
          id="user-name"
          label="Nombre y apellido"
          onChange={(event) => update("name", event.target.value)}
          placeholder="Lucía Pérez"
          value={values.name}
        />
        <BoardInput
          error={errors.email}
          icon={<Mail aria-hidden="true" className={userDialogSettingsPage.icon} />}
          id="user-email"
          label="Email"
          onChange={(event) => update("email", event.target.value)}
          placeholder="lucia@elancla.org"
          type="email"
          value={values.email}
        />
        <div className={userDialogSettingsPage.pair}>
          <BoardSelect
            error={errors.role}
            id="user-role"
            label="Rol"
            onValueChange={(value) => update("role", value)}
            options={ROLE_OPTIONS}
            placeholder="Elegir rol"
            value={values.role}
          />
          <BoardSelect
            id="user-ministry"
            label="Ministerio"
            onValueChange={(value) => update("ministry", value)}
            options={ministryOptions}
            placeholder="Elegir ministerio"
            value={values.ministry}
          />
        </div>
        {isEdit ? null : (
          <p className={userDialogSettingsPage.notice}>
            Enviaremos una invitación a este correo para que cree su contraseña. Vence en 7 días.
          </p>
        )}
        <div className={userDialogSettingsPage.footer}>
          <BoardButton onClick={onCancel} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton onClick={submit} variant="primary">
            <Mail aria-hidden="true" className={userDialogSettingsPage.buttonIcon} />
            {isEdit ? "Guardar cambios" : "Enviar invitación"}
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
