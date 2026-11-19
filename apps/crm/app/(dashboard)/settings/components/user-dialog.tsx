"use client";

import type { MinistryDto, RoleDto, UserDto } from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { Dialog } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { describeApiFailure } from "../utils";
import { OptionChecklist } from "./option-checklist";

const userDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  error: cn("text-xs font-semibold text-primary"),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
};

const LAST_ADMIN_MESSAGE = "Debe quedar al menos un administrador.";

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

interface UserDialogProps {
  /** User being edited; `undefined` keeps the dialog closed. (Invitations have their own dialog.) */
  user: UserDto | undefined;
  /** `null` when the caller cannot list roles (then the roles cannot be changed here). */
  roles: RoleDto[] | null;
  ministries: MinistryDto[] | null;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ user, roles, ministries, onOpenChange }: UserDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={user !== undefined}>
      {/* Remounting per target resets the fields without an effect. */}
      {user ? (
        <UserDialogForm
          key={user.id}
          ministries={ministries}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
          roles={roles}
          user={user}
        />
      ) : null}
    </Dialog>
  );
}

interface UserDialogFormProps {
  user: UserDto;
  roles: RoleDto[] | null;
  ministries: MinistryDto[] | null;
  onCancel: () => void;
  onSaved: () => void;
}

function UserDialogForm({ user, roles, ministries, onCancel, onSaved }: UserDialogFormProps) {
  const router = useRouter();
  const [roleIds, setRoleIds] = useState(user.roles.map((role) => role.id));
  const [ministryIds, setMinistryIds] = useState(user.ministries.map((ministry) => ministry.id));
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function save(): Promise<void> {
    setError(undefined);
    setIsSaving(true);
    const rolesChanged =
      roles !== null &&
      !sameSet(
        roleIds,
        user.roles.map((role) => role.id),
      );
    const ministriesChanged =
      ministries !== null &&
      !sameSet(
        ministryIds,
        user.ministries.map((item) => item.id),
      );
    const responses: Response[] = [];
    if (rolesChanged) {
      responses.push(
        await apiClient.users[":id"].roles.$put({ param: { id: user.id }, json: { roleIds } }),
      );
    }
    if (ministriesChanged) {
      responses.push(
        await apiClient.users[":id"].ministries.$put({
          param: { id: user.id },
          json: { ministryIds },
        }),
      );
    }
    setIsSaving(false);
    const failed = responses.find((response) => !response.ok);
    if (failed) {
      setError(describeApiFailure(failed.status, LAST_ADMIN_MESSAGE));
      return;
    }
    toast.success("Usuario actualizado");
    router.refresh();
    onSaved();
  }

  return (
    <BoardDialogContent
      description={`${user.email} · define sus roles y los ministerios en los que actúa.`}
      title={user.name}
    >
      <form
        className={userDialogSettingsPage.form}
        noValidate={true}
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
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
          legend="Ministerios"
          onChange={setMinistryIds}
          options={(ministries ?? []).map((ministry) => ({
            value: ministry.id,
            label: ministry.name,
          }))}
          selected={ministryIds}
        />
        {error ? <span className={userDialogSettingsPage.error}>{error}</span> : null}
        <div className={userDialogSettingsPage.footer}>
          <BoardButton onClick={onCancel} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton disabled={isSaving} onClick={() => void save()} variant="primary">
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
