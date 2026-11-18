import type { RoleProfile, SettingsRole } from "../types";
import { EMPTY_GRID, FULL_GRID, OPERATIONAL_GRID } from "./permission-modules";

export const ROLE_PROFILE_LABELS: Record<RoleProfile, string> = {
  admin: "Admin",
  treasury: "Tesorería",
  leader: "Líder",
  reader: "Lector",
};

// Seed roles until the Roles API is wired.
export const settingsRoles: SettingsRole[] = [
  {
    id: "role-admin",
    name: "Administrador",
    profile: "admin",
    description: "Administra configuración crítica, aprobaciones y cierres del período.",
    scope: ["Todo el sistema"],
    membersCount: 1,
    permissions: FULL_GRID,
  },
  {
    id: "role-treasury",
    name: "Tesorería",
    profile: "treasury",
    description: "Registra movimientos, boletas y comprobantes, y aprueba solicitudes.",
    scope: ["Movimientos", "Solicitudes", "Documentos"],
    membersCount: 1,
    permissions: OPERATIONAL_GRID,
  },
  {
    id: "role-leader",
    name: "Líder de ministerio",
    profile: "leader",
    description: "Pide fondos y consulta el presupuesto de su ministerio.",
    scope: ["Solicitudes", "Presupuestos"],
    membersCount: 3,
    permissions: {
      ...EMPTY_GRID,
      requests: ["view", "create", "edit"],
      budgets: ["view"],
    },
  },
  {
    id: "role-reader",
    name: "Lector",
    profile: "reader",
    description: "Acceso restringido para seguimiento institucional y revisión ejecutiva.",
    scope: ["Informes"],
    membersCount: 2,
    permissions: { ...EMPTY_GRID, reports: ["view"] },
  },
];
