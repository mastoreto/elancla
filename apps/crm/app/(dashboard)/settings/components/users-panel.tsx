"use client";

import { PencilLine, Trash2 } from "lucide-react";
import { useState } from "react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import type { SettingsUser } from "../types";
import { RoleProfilePill } from "./role-profile-pill";

const COLUMNS = "1.6fr 1fr 1fr 1fr 84px";
const HEADERS = ["Usuario", "Rol", "Último acceso", "Estado", ""];
const PAGE_SIZE = 8;

const usersPanelSettingsPage = {
  container: cn("flex flex-col gap-5"),
  card: cn("flex flex-col gap-1 p-5"),
  person: cn("flex min-w-0 items-center gap-3"),
  avatar: cn("size-10 text-xs font-extrabold"),
  personText: cn("flex min-w-0 flex-col"),
  name: cn("font-medium"),
  email: cn("truncate text-[12.5px] text-[var(--tinta-apagada)]"),
  muted: cn("text-[var(--tinta-suave)]"),
  status: cn("w-fit"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-3.5"),
};

interface UsersPanelProps {
  users: SettingsUser[];
  pendingInvitations: number;
  onEdit: (user: SettingsUser) => void;
  onDelete: (userId: string) => void;
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function UsersPanel({ users, pendingInvitations, onEdit, onDelete }: UsersPanelProps) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const lastAccess = users[0];

  return (
    <div className={usersPanelSettingsPage.container}>
      <StatCardGrid>
        <StatCard
          detail={`${pluralize(pendingInvitations, "invitación pendiente", "invitaciones pendientes")}`}
          highlighted={true}
          label="Usuarios activos"
          value={String(users.length)}
        />
        <StatCard
          detail="Acceso completo"
          label="Administradores"
          value={String(users.filter((user) => user.role === "admin").length)}
        />
        <StatCard
          detail="Aprueban solicitudes"
          label="Tesorería"
          value={String(users.filter((user) => user.role === "treasury").length)}
        />
        <StatCard
          detail={
            lastAccess ? `${lastAccess.name} · ${lastAccess.lastAccess.split(" ").pop()}` : "—"
          }
          label="Último acceso"
          value="hoy"
        />
      </StatCardGrid>

      <BoardCard className={usersPanelSettingsPage.card}>
        <BoardTableHead columns={COLUMNS} labels={HEADERS} />
        <BoardTableList>
          {visible.map((user) => (
            <BoardTableRow columns={COLUMNS} key={user.id}>
              <div className={usersPanelSettingsPage.person}>
                <IconBubble className={usersPanelSettingsPage.avatar} tone={user.tone}>
                  {user.initials}
                </IconBubble>
                <div className={usersPanelSettingsPage.personText}>
                  <span className={usersPanelSettingsPage.name}>{user.name}</span>
                  <span className={usersPanelSettingsPage.email}>{user.email}</span>
                </div>
              </div>
              <RoleProfilePill profile={user.role} withDot={true} />
              <span className={usersPanelSettingsPage.muted}>{user.lastAccess}</span>
              <StatusPill className={usersPanelSettingsPage.status} tone="green">
                Activo
              </StatusPill>
              <div className={usersPanelSettingsPage.actions}>
                <RowIconButton label={`Editar ${user.name}`} onClick={() => onEdit(user)}>
                  <PencilLine aria-hidden="true" className={usersPanelSettingsPage.icon} />
                </RowIconButton>
                <BoardConfirmDialog
                  description={`${user.name} perderá el acceso a iEkklesia. Podrás invitarla de nuevo cuando quieras.`}
                  onConfirm={() => onDelete(user.id)}
                  title="Eliminar usuario"
                  trigger={
                    <button
                      aria-label={`Eliminar ${user.name}`}
                      className={rowIconButtonClass}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className={usersPanelSettingsPage.icon} />
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
          total={users.length}
        />
      </BoardCard>
    </div>
  );
}
