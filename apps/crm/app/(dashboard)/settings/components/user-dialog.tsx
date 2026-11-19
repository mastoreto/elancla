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

const userDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  pair: cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
};

const ROLE_OPTIONS: SettingsSelectOption[] = Object.entries(ROLE_PROFILE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

interface UserDialogProps {
  /** User being edited; `undefined` keeps the dialog closed. (Invitations have their own dialog.) */
  user: SettingsUser | undefined;
  ministryOptions: SettingsSelectOption[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserInviteValues) => void;
}

export function UserDialog({ user, ministryOptions, onOpenChange, onSubmit }: UserDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={user !== undefined}>
      {/* Remounting per target resets the fields without an effect. */}
      {user ? (
        <UserDialogForm
          key={user.id}
          ministryOptions={ministryOptions}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          user={user}
        />
      ) : null}
    </Dialog>
  );
}

interface UserDialogFormProps {
  user: SettingsUser;
  ministryOptions: SettingsSelectOption[];
  onCancel: () => void;
  onSubmit: (values: UserInviteValues) => void;
}

function UserDialogForm({ user, ministryOptions, onCancel, onSubmit }: UserDialogFormProps) {
  const [values, setValues] = useState<UserInviteValues>({
    name: user.name,
    email: user.email,
    role: user.role,
    ministry: "",
  });
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
      description="Actualiza el rol y los datos de esta persona."
      title="Editar usuario"
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
        <div className={userDialogSettingsPage.footer}>
          <BoardButton onClick={onCancel} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton onClick={submit} variant="primary">
            Guardar cambios
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
