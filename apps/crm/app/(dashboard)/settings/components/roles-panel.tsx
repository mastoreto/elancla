"use client";

import { ADMIN_ROLE_KEY, PERMISSION_RESOURCES, PERMISSIONS, type RoleDto } from "@ancla/contracts";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { PERMISSION_RESOURCE_INFO } from "../data/permission-labels";

const COLUMNS = "1fr 1.5fr 2.4fr 70px 84px";
const HEADERS = ["Rol", "Descripción", "Alcance", "Usuarios", ""];
const PAGE_SIZE = 8;
const MAX_SCOPE_CHIPS = 5;

const rolesPanelSettingsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  header: cn("[&>div:first-child]:flex-1"),
  nameCell: cn("flex min-w-0 flex-col items-start gap-1"),
  name: cn("font-bold"),
  description: cn("text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
  scope: cn("flex flex-wrap gap-1.5"),
  scopeChip: cn(
    "inline-flex h-[34px] items-center rounded-full bg-card px-3.5 text-[13px] font-semibold whitespace-nowrap text-[var(--tinta-suave)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  count: cn("tabular-nums"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-3.5"),
  disabled: cn("cursor-not-allowed opacity-50 hover:bg-secondary hover:text-foreground"),
  buttonIcon: cn("size-4"),
};

/** Resource names a role touches, in catalog order; the admin role touches everything. */
function summarizeScope(role: RoleDto): string[] {
  if (role.key === ADMIN_ROLE_KEY) return ["Todo el sistema"];
  const touched = PERMISSION_RESOURCES.filter((resource) =>
    role.grants.some((grant) => grant.resource === resource),
  ).map((resource) => PERMISSION_RESOURCE_INFO[resource].label);
  if (touched.length <= MAX_SCOPE_CHIPS) return touched;
  return [...touched.slice(0, MAX_SCOPE_CHIPS), `+${touched.length - MAX_SCOPE_CHIPS}`];
}

interface RolesPanelProps {
  roles: RoleDto[];
}

export function RolesPanel({ roles }: RolesPanelProps) {
  const router = useRouter();
  const access = useAccess();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = roles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function remove(role: RoleDto): Promise<void> {
    const response = await apiClient.roles[":id"].$delete({ param: { id: role.id } });
    if (!response.ok) {
      toast.error(describeApiFailure(response.status, "El rol todavía tiene personas asignadas."));
      return;
    }
    toast.success("Rol eliminado");
    router.refresh();
  }

  return (
    <BoardCard className={rolesPanelSettingsPage.card}>
      <BoardCardHeader
        action={
          access.isAdmin && can(access, PERMISSIONS.roles.create) ? (
            <BoardButton
              href={getChurchRoutePath("settings", "roles", "new")}
              size="sm"
              variant="soft"
            >
              <Plus aria-hidden="true" className={rolesPanelSettingsPage.buttonIcon} />
              Nuevo rol
            </BoardButton>
          ) : null
        }
        subtitle="Organiza perfiles operativos para limitar alcance, aprobaciones y auditoría"
        title="Roles y permisos"
      />
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      <BoardTableList>
        {visible.map((role) => {
          const isSeeded = role.key !== null;
          // Only an admin manages roles; seeded roles are never deletable.
          const canManage = access.isAdmin && !isSeeded && can(access, PERMISSIONS.roles.delete);
          const hasMembers = role.memberCount > 0;
          return (
            <BoardTableRow columns={COLUMNS} key={role.id}>
              <div className={rolesPanelSettingsPage.nameCell}>
                <span className={rolesPanelSettingsPage.name}>{role.name}</span>
                {role.key === ADMIN_ROLE_KEY ? (
                  <StatusPill tone="ink">Acceso total</StatusPill>
                ) : null}
              </div>
              <span className={rolesPanelSettingsPage.description}>{role.description}</span>
              <div className={rolesPanelSettingsPage.scope}>
                {summarizeScope(role).map((item) => (
                  <span className={rolesPanelSettingsPage.scopeChip} key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <b className={rolesPanelSettingsPage.count}>{role.memberCount}</b>
              <div className={rolesPanelSettingsPage.actions}>
                <RowIconButton
                  href={getChurchRoutePath("settings", "roles", role.id, "edit")}
                  label={`Editar ${role.name}`}
                >
                  <PencilLine aria-hidden="true" className={rolesPanelSettingsPage.icon} />
                </RowIconButton>
                {canManage && hasMembers ? (
                  <Tooltip>
                    <TooltipTrigger asChild={true}>
                      <button
                        aria-disabled={true}
                        aria-label={`Eliminar ${role.name} (no disponible)`}
                        className={cn(rowIconButtonClass, rolesPanelSettingsPage.disabled)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className={rolesPanelSettingsPage.icon} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Tiene {role.memberCount}{" "}
                      {role.memberCount === 1 ? "usuario vinculado" : "usuarios vinculados"};
                      reasígnalos antes de borrar.
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                {canManage && !hasMembers ? (
                  <BoardConfirmDialog
                    description={`El rol ${role.name} se eliminará. Solo se puede eliminar si nadie lo tiene asignado.`}
                    onConfirm={() => void remove(role)}
                    title="Eliminar rol"
                    trigger={
                      <button
                        aria-label={`Eliminar ${role.name}`}
                        className={rowIconButtonClass}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className={rolesPanelSettingsPage.icon} />
                      </button>
                    }
                  />
                ) : null}
              </div>
            </BoardTableRow>
          );
        })}
      </BoardTableList>
      <BoardPagination
        onPageChange={setPage}
        page={currentPage}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={roles.length}
      />
    </BoardCard>
  );
}
