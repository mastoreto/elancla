import type { SettingsRole } from "../types";

// Seed roles until the Roles API is wired.
export const settingsRoles: SettingsRole[] = [
  {
    id: "role-1",
    name: "Tesorera General",
    description: "Administra configuración crítica, aprobaciones y cierres del período.",
    scope: "Acceso completo a tesorería, reportes y parámetros del sistema.",
    membersCount: 1,
    permissions: [
      "Aprobar solicitudes",
      "Editar configuración",
      "Cerrar período",
      "Gestionar cuentas",
    ],
  },
  {
    id: "role-2",
    name: "Revisor Financiero",
    description: "Supervisa consistencia operativa y verifica trazabilidad antes de auditoría.",
    scope: "Lectura avanzada, comentarios y revisión de justificativos.",
    membersCount: 2,
    permissions: [
      "Ver auditoría",
      "Exportar informes",
      "Revisar comprobantes",
      "Consultar movimientos",
    ],
  },
  {
    id: "role-3",
    name: "Operadora de Cajas",
    description: "Registra movimientos, boletas y comprobantes sin acceso a parámetros críticos.",
    scope: "Operación diaria con alcance limitado a registro y edición básica.",
    membersCount: 3,
    permissions: [
      "Crear movimientos",
      "Registrar boletas",
      "Crear comprobantes",
      "Adjuntar respaldos",
    ],
  },
  {
    id: "role-4",
    name: "Consulta",
    description: "Acceso restringido para seguimiento institucional y revisión ejecutiva.",
    scope: "Solo lectura sobre informes, presupuestos y panel general.",
    membersCount: 4,
    permissions: ["Ver panel", "Ver presupuestos", "Ver informes"],
  },
];

export const SETTINGS_PERMISSION_GROUPS = [
  {
    group: "Tesorería",
    permissions: [
      "Crear movimientos",
      "Registrar boletas",
      "Crear comprobantes",
      "Adjuntar respaldos",
      "Consultar movimientos",
    ],
  },
  {
    group: "Aprobaciones",
    permissions: ["Aprobar solicitudes", "Cerrar período", "Revisar comprobantes"],
  },
  {
    group: "Informes",
    permissions: [
      "Ver panel",
      "Ver presupuestos",
      "Ver informes",
      "Exportar informes",
      "Ver auditoría",
    ],
  },
  { group: "Sistema", permissions: ["Editar configuración", "Gestionar cuentas"] },
] as const;
