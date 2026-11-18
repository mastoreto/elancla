import type {
  PermissionActionId,
  PermissionGrid,
  PermissionModuleId,
  PermissionPresetId,
} from "../types";

export const PERMISSION_ACTIONS: { id: PermissionActionId; label: string }[] = [
  { id: "view", label: "Ver" },
  { id: "create", label: "Crear" },
  { id: "edit", label: "Editar" },
  { id: "approve", label: "Aprobar" },
  { id: "delete", label: "Eliminar" },
];

export const PERMISSION_MODULES: { id: PermissionModuleId; label: string; hint: string }[] = [
  { id: "movements", label: "Movimientos", hint: "Ingresos y egresos" },
  { id: "requests", label: "Solicitudes", hint: "Pedidos de fondos" },
  { id: "vouchers", label: "Boletas y comprobantes", hint: "Respaldo de gastos" },
  { id: "projects", label: "Proyectos", hint: "Iniciativas con presupuesto" },
  { id: "budgets", label: "Presupuestos", hint: "Montos por ministerio" },
  { id: "voting", label: "Votaciones", hint: "Asambleas y quórum" },
  { id: "reports", label: "Informes", hint: "Reportes y exportación" },
  { id: "content", label: "Contenido", hint: "Sitio, blog y podcasts" },
  { id: "settings", label: "Configuración", hint: "Usuarios, roles y cuentas" },
];

export const EMPTY_GRID: PermissionGrid = {
  movements: [],
  requests: [],
  vouchers: [],
  projects: [],
  budgets: [],
  voting: [],
  reports: [],
  content: [],
  settings: [],
};

const ALL_ACTIONS = PERMISSION_ACTIONS.map((action) => action.id);

const OPERATIONAL_GRID: PermissionGrid = {
  ...EMPTY_GRID,
  movements: ["view", "create", "edit"],
  requests: ["view", "create", "edit", "approve"],
  vouchers: ["view", "create", "edit"],
  projects: ["view"],
  budgets: ["view"],
  voting: ["view"],
  reports: ["view", "create"],
};

export const FULL_GRID: PermissionGrid = {
  movements: [...ALL_ACTIONS],
  requests: [...ALL_ACTIONS],
  vouchers: [...ALL_ACTIONS],
  projects: [...ALL_ACTIONS],
  budgets: [...ALL_ACTIONS],
  voting: [...ALL_ACTIONS],
  reports: [...ALL_ACTIONS],
  content: [...ALL_ACTIONS],
  settings: [...ALL_ACTIONS],
};

const READONLY_GRID: PermissionGrid = {
  movements: ["view"],
  requests: ["view"],
  vouchers: ["view"],
  projects: ["view"],
  budgets: ["view"],
  voting: ["view"],
  reports: ["view"],
  content: ["view"],
  settings: ["view"],
};

export const PERMISSION_PRESETS: { id: PermissionPresetId; label: string; grid: PermissionGrid }[] =
  [
    { id: "readonly", label: "Solo lectura", grid: READONLY_GRID },
    { id: "operational", label: "Operativo", grid: OPERATIONAL_GRID },
    { id: "full", label: "Completo", grid: FULL_GRID },
  ];

/** Starting point for a new role: it can see movements and reports. */
export const NEW_ROLE_GRID: PermissionGrid = {
  ...EMPTY_GRID,
  movements: ["view"],
  reports: ["view"],
};

export { OPERATIONAL_GRID };
