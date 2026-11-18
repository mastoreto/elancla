"use client";

import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { SettingsRole } from "../types";
import { RoleProfilePill } from "./role-profile-pill";

const COLUMNS = "1fr 110px 1.5fr 2.4fr 70px 84px";
const HEADERS = ["Rol", "Perfil", "Descripción", "Alcance", "Usuarios", ""];
const PAGE_SIZE = 8;

const rolesPanelSettingsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  header: cn("[&>div:first-child]:flex-1"),
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
  buttonIcon: cn("size-4"),
};

interface RolesPanelProps {
  roles: SettingsRole[];
  onDelete: (roleId: string) => void;
}

export function RolesPanel({ roles, onDelete }: RolesPanelProps) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = roles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <BoardCard className={rolesPanelSettingsPage.card}>
      <BoardCardHeader
        action={
          <BoardButton
            href={getChurchRoutePath("settings", "roles", "new")}
            size="sm"
            variant="soft"
          >
            <Plus aria-hidden="true" className={rolesPanelSettingsPage.buttonIcon} />
            Nuevo rol
          </BoardButton>
        }
        subtitle="Organiza perfiles operativos para limitar alcance, aprobaciones y auditoría"
        title="Roles y permisos"
      />
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      <BoardTableList>
        {visible.map((role) => (
          <BoardTableRow columns={COLUMNS} key={role.id}>
            <span className={rolesPanelSettingsPage.name}>{role.name}</span>
            <RoleProfilePill profile={role.profile} />
            <span className={rolesPanelSettingsPage.description}>{role.description}</span>
            <div className={rolesPanelSettingsPage.scope}>
              {role.scope.map((item) => (
                <span className={rolesPanelSettingsPage.scopeChip} key={item}>
                  {item}
                </span>
              ))}
            </div>
            <b className={rolesPanelSettingsPage.count}>{role.membersCount}</b>
            <div className={rolesPanelSettingsPage.actions}>
              <RowIconButton
                href={getChurchRoutePath("settings", "roles", role.id, "edit")}
                label={`Editar ${role.name}`}
              >
                <PencilLine aria-hidden="true" className={rolesPanelSettingsPage.icon} />
              </RowIconButton>
              <BoardConfirmDialog
                description={`El rol ${role.name} se eliminará. Las personas que lo tienen deberán asignarse a otro rol.`}
                onConfirm={() => onDelete(role.id)}
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
            </div>
          </BoardTableRow>
        ))}
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
