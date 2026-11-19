"use client";

import { ADMIN_ROLE_KEY, type RoleDto, type UserDto } from "@ancla/contracts";
import { PencilLine } from "lucide-react";
import { useState } from "react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { cn } from "@/lib/utils";

const COLUMNS = "1.6fr 1.4fr 1fr 1fr 60px";
const HEADERS = ["Usuario", "Roles", "Último acceso", "Ministerios", ""];
const PAGE_SIZE = 8;

const usersPanelSettingsPage = {
  container: cn("flex flex-col gap-5"),
  card: cn("flex flex-col gap-1 p-5"),
  person: cn("flex min-w-0 items-center gap-3"),
  avatar: cn("size-10 text-xs font-extrabold"),
  personText: cn("flex min-w-0 flex-col"),
  name: cn("font-medium"),
  email: cn("truncate text-[12.5px] text-[var(--tinta-apagada)]"),
  chips: cn("flex flex-wrap gap-1.5"),
  muted: cn("text-[var(--tinta-suave)]"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-3.5"),
};

const dateTimeFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatLastAccess(lastAccessAt: string | null): string {
  return lastAccessAt ? dateTimeFormat.format(new Date(lastAccessAt)) : "Nunca";
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

interface UsersPanelProps {
  users: UserDto[];
  /** Roles of the organization; used to count administrators. `null` without `roles:view`. */
  roles: RoleDto[] | null;
  pendingInvitations: number;
  onEdit: (user: UserDto) => void;
}

export function UsersPanel({ users, roles, pendingInvitations, onEdit }: UsersPanelProps) {
  const access = useAccess();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const adminRoleId = roles?.find((role) => role.key === ADMIN_ROLE_KEY)?.id;
  const adminCount = adminRoleId
    ? users.filter((user) => user.roles.some((role) => role.id === adminRoleId)).length
    : null;
  const withMinistry = users.filter((user) => user.ministries.length > 0).length;
  const lastAccessed = users
    .filter((user) => user.lastAccessAt)
    .sort((a, b) => (b.lastAccessAt ?? "").localeCompare(a.lastAccessAt ?? ""))[0];
  const canEdit = can(access, "users:edit");

  return (
    <div className={usersPanelSettingsPage.container}>
      <StatCardGrid>
        <StatCard
          detail={pluralize(pendingInvitations, "invitación pendiente", "invitaciones pendientes")}
          highlighted={true}
          label="Usuarios activos"
          value={String(users.length)}
        />
        <StatCard
          detail="Acceso completo"
          label="Administradores"
          value={adminCount === null ? "—" : String(adminCount)}
        />
        <StatCard
          detail="Con ministerio asignado"
          label="Ministerios"
          value={String(withMinistry)}
        />
        <StatCard
          detail={lastAccessed ? lastAccessed.name : "—"}
          label="Último acceso"
          value={lastAccessed ? formatLastAccess(lastAccessed.lastAccessAt) : "—"}
        />
      </StatCardGrid>

      <BoardCard className={usersPanelSettingsPage.card}>
        <BoardTableHead columns={COLUMNS} labels={HEADERS} />
        <BoardTableList>
          {visible.map((user) => (
            <BoardTableRow columns={COLUMNS} key={user.id}>
              <div className={usersPanelSettingsPage.person}>
                <IconBubble className={usersPanelSettingsPage.avatar} tone="gold">
                  {getInitials(user.name)}
                </IconBubble>
                <div className={usersPanelSettingsPage.personText}>
                  <span className={usersPanelSettingsPage.name}>{user.name}</span>
                  <span className={usersPanelSettingsPage.email}>{user.email}</span>
                </div>
              </div>
              <div className={usersPanelSettingsPage.chips}>
                {user.roles.length === 0 ? (
                  <span className={usersPanelSettingsPage.muted}>Sin rol</span>
                ) : (
                  user.roles.map((role) => (
                    <StatusPill key={role.id} tone={role.name === "Administrador" ? "rose" : "ink"}>
                      {role.name}
                    </StatusPill>
                  ))
                )}
              </div>
              <span className={usersPanelSettingsPage.muted}>
                {formatLastAccess(user.lastAccessAt)}
              </span>
              <span className={usersPanelSettingsPage.muted}>
                {user.ministries.map((ministry) => ministry.name).join(", ") || "—"}
              </span>
              <div className={usersPanelSettingsPage.actions}>
                {canEdit ? (
                  <RowIconButton label={`Editar ${user.name}`} onClick={() => onEdit(user)}>
                    <PencilLine aria-hidden="true" className={usersPanelSettingsPage.icon} />
                  </RowIconButton>
                ) : null}
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
