"use client";

import { Check, ChevronRight, Trash2 } from "lucide-react";
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
} from "@/components/dashboard/board/board-form";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { NEW_ROLE_GRID, PERMISSION_PRESETS } from "../data/permission-modules";
import type { PermissionGrid, SettingsRole, SettingsUser } from "../types";
import {
  applyPreset,
  countActivePermissions,
  detectPreset,
  TOTAL_PERMISSIONS,
  toggleAction,
  toggleModule,
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
  people: cn("flex flex-wrap items-center gap-3.5"),
  peopleText: cn("flex min-w-0 flex-1 flex-col gap-2"),
  peopleTitle: cn("text-sm font-bold"),
  peopleRow: cn("flex items-center gap-2.5"),
  avatar: cn("size-9 text-[13px] font-extrabold"),
  peopleHint: cn("text-[13.5px] text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
};

interface RoleFormProps {
  /** `undefined` creates a role; otherwise the role being edited. */
  role?: SettingsRole;
  /** Users that currently hold the role (edit mode). */
  members?: SettingsUser[];
}

function describeMembers(members: SettingsUser[]): string {
  if (members.length === 0) return "Nadie tiene este rol todavía.";
  const names = members.map((member) => member.name).join(", ");
  const total = `${members.length} ${members.length === 1 ? "usuario" : "usuarios"}`;
  return `${names} · ${total}. Los cambios se aplican la próxima vez que inicie sesión.`;
}

export function RoleForm({ role, members = [] }: RoleFormProps) {
  const router = useRouter();
  const isEdit = role !== undefined;
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [grid, setGrid] = useState<PermissionGrid>(role?.permissions ?? NEW_ROLE_GRID);
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({});

  const activePreset = detectPreset(grid);
  const rolesPath = getChurchRoutePath("settings");
  const title = isEdit ? `Editar rol: ${role.name}` : "Nuevo rol";

  // Seed-data screen: validating and going back to the list stands in for the real save.
  const save = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Ponle un nombre al rol";
    if (countActivePermissions(grid) === 0) next.permissions = "Elige al menos un permiso";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success(isEdit ? "Rol actualizado" : "Rol creado");
    router.push(rolesPath);
  };

  return (
    <>
      <nav aria-label="Ruta" className={roleFormSettingsPage.breadcrumb}>
        <Link className={roleFormSettingsPage.crumb} href={rolesPath}>
          Configuración
        </Link>
        <ChevronRight aria-hidden="true" className={roleFormSettingsPage.crumbIcon} />
        <Link className={roleFormSettingsPage.crumb} href={rolesPath}>
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
          save();
        }}
      >
        <header className={roleFormSettingsPage.header}>
          <h2 className={roleFormSettingsPage.title}>{title}</h2>
          <p className={roleFormSettingsPage.subtitle}>
            Define qué puede ver y hacer cada persona con este rol
          </p>
        </header>

        <BoardFormSections>
          <div className={roleFormSettingsPage.names}>
            <BoardInput
              error={errors.name}
              id="role-name"
              label="Nombre del rol"
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Secretaría"
              value={name}
            />
            <BoardInput
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
                  key={preset.id}
                  onClick={() => setGrid(applyPreset(preset.id))}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
              <span className={roleFormSettingsPage.spacer} />
              <span className={roleFormSettingsPage.count}>
                <b className={roleFormSettingsPage.countValue}>{countActivePermissions(grid)}</b> de{" "}
                {TOTAL_PERMISSIONS} permisos activos
              </span>
            </div>
            <PermissionMatrix
              grid={grid}
              onToggleAction={(module, action) =>
                setGrid((previous) => toggleAction(previous, module, action))
              }
              onToggleModule={(module) => setGrid((previous) => toggleModule(previous, module))}
            />
            {errors.permissions ? (
              <span className={roleFormSettingsPage.error}>{errors.permissions}</span>
            ) : null}
          </BoardFormSection>

          {isEdit ? (
            <>
              <BoardFormDivider />
              <div className={roleFormSettingsPage.people}>
                <div className={roleFormSettingsPage.peopleText}>
                  <b className={roleFormSettingsPage.peopleTitle}>Personas con este rol</b>
                  <div className={roleFormSettingsPage.peopleRow}>
                    {members[0] ? (
                      <IconBubble className={roleFormSettingsPage.avatar} tone={members[0].tone}>
                        {members[0].initials}
                      </IconBubble>
                    ) : null}
                    <span className={roleFormSettingsPage.peopleHint}>
                      {describeMembers(members)}
                    </span>
                  </div>
                </div>
                <BoardConfirmDialog
                  description={`El rol ${role.name} se eliminará. Las personas que lo tienen deberán asignarse a otro rol.`}
                  onConfirm={() => {
                    toast.success("Rol eliminado");
                    router.push(rolesPath);
                  }}
                  title="Eliminar rol"
                  trigger={
                    <BoardButton variant="soft">
                      <Trash2 aria-hidden="true" className={roleFormSettingsPage.icon} />
                      Eliminar rol
                    </BoardButton>
                  }
                />
              </div>
            </>
          ) : null}
        </BoardFormSections>

        <BoardFormFooter>
          <BoardButton href={rolesPath} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton onClick={save} variant="primary">
            <Check aria-hidden="true" className={roleFormSettingsPage.icon} />
            {isEdit ? "Guardar cambios" : "Crear rol"}
          </BoardButton>
        </BoardFormFooter>
      </form>
    </>
  );
}
