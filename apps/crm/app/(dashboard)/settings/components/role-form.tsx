"use client";

import {
  ADMIN_ROLE_KEY,
  isDangerousPermission,
  PERMISSIONS,
  type RoleDto,
  type UserDto,
} from "@ancla/contracts";
import { Check, ChevronRight, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import {
  BoardFormDivider,
  BoardFormFooter,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_RESOURCE_INFO,
  SESSION_DURATION_OPTIONS,
} from "../data/permission-labels";
import type { PermissionGrid } from "../types";
import {
  applyPreset,
  countActivePermissions,
  detectPreset,
  NEW_ROLE_GRID,
  PERMISSION_PRESETS,
  setScope,
  TOTAL_PERMISSIONS,
  toGrants,
  toGrid,
  toggleAction,
  toggleResource,
} from "../utils";
import { PermissionMatrix } from "./permission-matrix";

const roleFormSettingsPage = {
  breadcrumb: cn("mx-auto mb-5 flex w-full max-w-[1060px] items-center gap-2 text-sm"),
  crumb: cn("font-medium text-[var(--tinta-apagada)] hover:text-foreground"),
  crumbIcon: cn("size-4 text-[var(--tinta-apagada)]"),
  crumbCurrent: cn("font-bold"),
  card: cn("mx-auto w-full max-w-[1060px] rounded-[28px] bg-card p-[30px] shadow-(--sombra)"),
  header: cn("mb-3.5 flex flex-col gap-[3px]"),
  title: cn("font-display text-[21px] font-medium tracking-tight"),
  subtitle: cn("text-[13px] text-[var(--tinta-apagada)]"),
  names: cn("grid grid-cols-1 gap-3.5 md:grid-cols-[1fr_1.4fr]"),
  presets: cn("flex flex-wrap items-center gap-2"),
  presetsLabel: cn("text-[13px] text-[var(--tinta-apagada)]"),
  preset: cn(
    "inline-flex h-[34px] items-center rounded-full bg-card px-3.5 text-[13px] font-semibold whitespace-nowrap text-[var(--tinta-suave)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  presetActive: cn("bg-foreground text-white shadow-none"),
  spacer: cn("flex-1"),
  count: cn("text-[13px] text-[var(--tinta-suave)]"),
  countValue: cn("font-bold text-foreground"),
  error: cn("text-xs font-semibold text-primary"),
  session: cn("grid grid-cols-1 items-start gap-3.5 md:grid-cols-2"),
  danger: cn(
    "flex items-start gap-2.5 rounded-[18px] bg-[var(--granada-50)] px-4 py-3.5 text-[13px] leading-normal text-foreground",
    "shadow-[inset_0_0_0_1px_rgba(194,58,78,0.25)] [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-primary",
  ),
  notice: cn(
    "rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
  people: cn("flex flex-wrap items-center gap-3.5"),
  peopleText: cn("flex min-w-0 flex-1 flex-col gap-2"),
  peopleTitle: cn("text-sm font-bold"),
  peopleHint: cn("text-[13.5px] text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
  confirmIcon: cn("size-6"),
};

const SECONDS_TO_OPTION = new Map(
  SESSION_DURATION_OPTIONS.map((option) => [option.seconds, option.value]),
);

interface RoleFormProps {
  /** `undefined` creates a role; otherwise the role being edited. */
  role?: RoleDto;
  /** Users that currently hold the role (edit mode). */
  members?: UserDto[];
}

function describeMembers(members: UserDto[]): string {
  if (members.length === 0) return "Nadie tiene este rol todavía.";
  const names = members.map((member) => member.name).join(", ");
  const total = `${members.length} ${members.length === 1 ? "usuario" : "usuarios"}`;
  return `${names} · ${total}. Los cambios se aplican en la próxima solicitud de cada persona.`;
}

function toDurationOption(seconds: number | null): string {
  return SECONDS_TO_OPTION.get(seconds) ?? "default";
}

export function RoleForm({ role, members = [] }: RoleFormProps) {
  const router = useRouter();
  const access = useAccess();
  const isEdit = role !== undefined;
  const isAdminRole = role?.key === ADMIN_ROLE_KEY;
  const holdsRole = role ? access.roles.some((held) => held.id === role.id) : false;
  // Managing roles is admin-only (the API enforces it too), whatever the role grants.
  const canSave =
    access.isAdmin &&
    can(access, isEdit ? PERMISSIONS.roles.edit : PERMISSIONS.roles.create) &&
    !isAdminRole &&
    !holdsRole;
  const canDelete =
    isEdit && role.key === null && access.isAdmin && can(access, PERMISSIONS.roles.delete);

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [grid, setGrid] = useState<PermissionGrid>(role ? toGrid(role.grants) : NEW_ROLE_GRID);
  const [persistentSession, setPersistentSession] = useState(role?.persistentSession ?? true);
  const [duration, setDuration] = useState(toDurationOption(role?.maxSessionSeconds ?? null));
  const [errors, setErrors] = useState<{ name?: string; permissions?: string; form?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const dangerousGrants = toGrants(grid).filter((grant) =>
    isDangerousPermission(grant.resource, grant.action),
  );
  const activePreset = detectPreset(grid);
  const settingsPath = getChurchRoutePath("settings");
  const title = isEdit ? `Editar rol: ${role.name}` : "Nuevo rol";
  const maxSessionSeconds =
    SESSION_DURATION_OPTIONS.find((option) => option.value === duration)?.seconds ?? null;

  async function save(): Promise<void> {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Ponle un nombre al rol";
    if (countActivePermissions(grid) === 0) next.permissions = "Elige al menos un permiso";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const json = {
      name: name.trim(),
      description: description.trim(),
      persistentSession,
      maxSessionSeconds,
      grants: toGrants(grid),
    };
    setIsSaving(true);
    const response = role
      ? await apiClient.roles[":id"].$patch({ param: { id: role.id }, json })
      : await apiClient.roles.$post({ json });
    setIsSaving(false);
    if (!response.ok) {
      setErrors({ form: describeApiFailure(response.status, "Ya existe un rol con ese nombre.") });
      return;
    }
    toast.success(isEdit ? "Rol actualizado" : "Rol creado");
    router.push(settingsPath);
    router.refresh();
  }

  async function remove(): Promise<void> {
    if (!role) return;
    const response = await apiClient.roles[":id"].$delete({ param: { id: role.id } });
    if (!response.ok) {
      toast.error(
        describeApiFailure(response.status, "El rol todavía tiene personas: reasígnalas primero."),
      );
      return;
    }
    toast.success("Rol eliminado");
    router.push(settingsPath);
    router.refresh();
  }

  const lockedReason = access.isAdmin
    ? isAdminRole
      ? "El rol Administrador tiene acceso total y no se puede modificar."
      : holdsRole
        ? "No puedes editar un rol que tienes asignado: pídele a otra persona que lo haga."
        : null
    : "Solo un administrador puede crear o modificar roles.";

  return (
    <>
      <nav aria-label="Ruta" className={roleFormSettingsPage.breadcrumb}>
        <Link className={roleFormSettingsPage.crumb} href={settingsPath}>
          Configuración
        </Link>
        <ChevronRight aria-hidden="true" className={roleFormSettingsPage.crumbIcon} />
        <Link className={roleFormSettingsPage.crumb} href={`${settingsPath}?tab=roles`}>
          Roles y permisos
        </Link>
        <ChevronRight aria-hidden="true" className={roleFormSettingsPage.crumbIcon} />
        <span className={roleFormSettingsPage.crumbCurrent}>{title}</span>
      </nav>

      <form
        className={roleFormSettingsPage.card}
        noValidate={true}
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <header className={roleFormSettingsPage.header}>
          <h2 className={roleFormSettingsPage.title}>{title}</h2>
          <p className={roleFormSettingsPage.subtitle}>
            Define qué puede ver y hacer cada persona con este rol
          </p>
        </header>

        <BoardFormSections>
          {lockedReason ? <p className={roleFormSettingsPage.notice}>{lockedReason}</p> : null}
          <div className={roleFormSettingsPage.names}>
            <BoardInput
              disabled={!canSave}
              error={errors.name}
              id="role-name"
              label="Nombre del rol"
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Secretaría"
              value={name}
            />
            <BoardInput
              disabled={!canSave}
              id="role-description"
              label="Descripción"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Para qué sirve este rol"
              value={description}
            />
          </div>

          <BoardFormDivider />

          <BoardFormSection>
            <div className={roleFormSettingsPage.presets}>
              <span className={roleFormSettingsPage.presetsLabel}>Partir de un perfil:</span>
              {PERMISSION_PRESETS.map((preset) => (
                <button
                  aria-pressed={activePreset === preset.id}
                  className={cn(
                    roleFormSettingsPage.preset,
                    activePreset === preset.id && roleFormSettingsPage.presetActive,
                  )}
                  disabled={!canSave}
                  key={preset.id}
                  onClick={() => setGrid(applyPreset(preset.id))}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
              <span className={roleFormSettingsPage.spacer} />
              <span className={roleFormSettingsPage.count}>
                <b className={roleFormSettingsPage.countValue}>
                  {isAdminRole ? TOTAL_PERMISSIONS : countActivePermissions(grid)}
                </b>{" "}
                de {TOTAL_PERMISSIONS} permisos activos
              </span>
            </div>
            <PermissionMatrix
              grid={isAdminRole ? applyPreset("full") : grid}
              onChangeScope={(resource, action, scope) =>
                setGrid((previous) => setScope(previous, resource, action, scope))
              }
              onToggleAction={(resource, action) =>
                setGrid((previous) => toggleAction(previous, resource, action))
              }
              onToggleResource={(resource) =>
                setGrid((previous) => toggleResource(previous, resource))
              }
              readOnly={!canSave}
            />
            {dangerousGrants.length > 0 && canSave ? (
              <p className={roleFormSettingsPage.danger} role="alert">
                <TriangleAlert aria-hidden="true" className={roleFormSettingsPage.icon} />
                <span>
                  <b>Permisos peligrosos activos ({dangerousGrants.length}).</b> Permiten controlar
                  accesos: quien tenga este rol podrá invitar personas, asignar roles o cambiar la
                  configuración, y así ganar más poder del previsto. Actívalos solo para personas de
                  máxima confianza.
                </span>
              </p>
            ) : null}
            {errors.permissions ? (
              <span className={roleFormSettingsPage.error}>{errors.permissions}</span>
            ) : null}
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <div className={roleFormSettingsPage.session}>
              <BoardSwitchRow
                checked={persistentSession}
                disabled={!canSave}
                hint="Si lo apagas, la sesión se cierra al cerrar el navegador."
                onCheckedChange={setPersistentSession}
                title="Sesión persistente"
              />
              <BoardSelect
                disabled={!canSave}
                hint="Pasado este tiempo la persona debe iniciar sesión de nuevo."
                id="role-session-duration"
                label="Duración máxima de la sesión"
                onValueChange={setDuration}
                options={SESSION_DURATION_OPTIONS}
                value={duration}
              />
            </div>
          </BoardFormSection>

          {isEdit ? (
            <>
              <BoardFormDivider />
              <div className={roleFormSettingsPage.people}>
                <div className={roleFormSettingsPage.peopleText}>
                  <b className={roleFormSettingsPage.peopleTitle}>Personas con este rol</b>
                  <span className={roleFormSettingsPage.peopleHint}>
                    {members.length > 0 || role.memberCount === 0
                      ? describeMembers(members)
                      : `${role.memberCount} ${role.memberCount === 1 ? "usuario" : "usuarios"}.`}
                  </span>
                </div>
                {canDelete ? (
                  <BoardConfirmDialog
                    description={`El rol ${role.name} se eliminará. Solo se puede eliminar si nadie lo tiene asignado.`}
                    onConfirm={() => void remove()}
                    title="Eliminar rol"
                    trigger={
                      <BoardButton variant="soft">
                        <Trash2 aria-hidden="true" className={roleFormSettingsPage.icon} />
                        Eliminar rol
                      </BoardButton>
                    }
                  />
                ) : null}
              </div>
            </>
          ) : null}
          {errors.form ? <span className={roleFormSettingsPage.error}>{errors.form}</span> : null}
        </BoardFormSections>

        <BoardFormFooter>
          <BoardButton href={settingsPath} variant="ghost">
            Cancelar
          </BoardButton>
          {dangerousGrants.length > 0 ? (
            <BoardConfirmDialog
              confirmLabel={isEdit ? "Guardar de todos modos" : "Crear de todos modos"}
              description="Este rol incluye permisos que permiten controlar accesos (invitar, asignar roles o cambiar la configuración)."
              icon={
                <TriangleAlert aria-hidden="true" className={roleFormSettingsPage.confirmIcon} />
              }
              notice={dangerousGrants
                .map(
                  (grant) =>
                    `${PERMISSION_RESOURCE_INFO[grant.resource].label}: ${PERMISSION_ACTION_LABELS[grant.action]}`,
                )
                .join(" · ")}
              onConfirm={() => void save()}
              title="Guardar permisos peligrosos"
              trigger={
                <BoardButton disabled={!canSave || isSaving} variant="primary">
                  <Check aria-hidden="true" className={roleFormSettingsPage.icon} />
                  {isEdit ? "Guardar cambios" : "Crear rol"}
                </BoardButton>
              }
            />
          ) : (
            <BoardButton
              disabled={!canSave || isSaving}
              onClick={() => void save()}
              variant="primary"
            >
              <Check aria-hidden="true" className={roleFormSettingsPage.icon} />
              {isEdit ? "Guardar cambios" : "Crear rol"}
            </BoardButton>
          )}
        </BoardFormFooter>
      </form>
    </>
  );
}
