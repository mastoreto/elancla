import {
  actionsOf,
  type PermissionAction,
  type PermissionGrant,
  type PermissionResource,
  type PermissionScope,
} from "../permissionCatalog";

export const ADMIN_ROLE_KEY = "admin";

/** Admin holds every permission implicitly (no grid rows), so future resources are covered. */
export const ADMIN_ROLE = {
  key: ADMIN_ROLE_KEY,
  name: "Administrador",
  description: "Acceso total a todo el sistema.",
} as const;

export interface SystemRolePreset {
  key: string;
  name: string;
  description: string;
  grants: PermissionGrant[];
}

function every(
  resource: PermissionResource,
  scope: PermissionScope,
): PermissionGrant[] {
  return actionsOf(resource).map((action) => ({ resource, action, scope }));
}

function only(
  resources: readonly PermissionResource[],
  actions: readonly PermissionAction[],
  scope: PermissionScope,
): PermissionGrant[] {
  return resources.flatMap((resource) =>
    actions
      .filter((action) => actionsOf(resource).includes(action))
      .map((action) => ({ resource, action, scope })),
  );
}

const TREASURY_RESOURCES = [
  "movements",
  "requests",
  "vouchers",
  "budgets",
  "projects",
  "ministries.finance",
] as const satisfies readonly PermissionResource[];

const TREASURY_AND_REPORTS = [
  ...TREASURY_RESOURCES,
  "reports",
] as const satisfies readonly PermissionResource[];

/** The ESRE roles (plus the content editor) the seed creates. All remain editable afterwards. */
export const SYSTEM_ROLE_PRESETS: readonly SystemRolePreset[] = [
  {
    key: "treasurer",
    name: "Tesorero",
    description: "Gestiona movimientos, comprobantes, solicitudes y presupuestos.",
    grants: TREASURY_AND_REPORTS.flatMap((resource) => every(resource, "all")),
  },
  {
    key: "auditor",
    name: "Síndico",
    description: "Revisa toda la tesorería y los informes, sin modificar nada.",
    grants: only(TREASURY_AND_REPORTS, ["view"], "all"),
  },
  {
    key: "board",
    name: "Directiva",
    description: "Supervisa la tesorería, aprueba solicitudes y gestiona proyectos.",
    grants: [
      ...only(TREASURY_AND_REPORTS, ["view"], "all"),
      ...only(["projects"], ["create", "edit"], "all"),
      ...only(["requests"], ["approve"], "all"),
    ],
  },
  {
    key: "pastoral",
    name: "Pastoral",
    description: "Acompaña a los ministerios y consulta solicitudes e informes.",
    grants: [
      ...only(["ministries.profile"], ["view"], "all"),
      ...only(["requests", "reports"], ["view"], "all"),
    ],
  },
  {
    key: "leader",
    name: "Líder",
    description: "Pide fondos y consulta el presupuesto de su ministerio.",
    grants: [
      ...only(["requests"], ["view", "create", "edit"], "ministry"),
      ...only(["budgets", "ministries.finance"], ["view"], "ministry"),
      ...only(["ministries.profile"], ["view", "edit"], "ministry"),
    ],
  },
  {
    key: "assembly",
    name: "Asamblea",
    description: "Consulta informes y participa de las votaciones.",
    grants: only(["reports", "voting"], ["view"], "all"),
  },
  {
    key: "office",
    name: "Oficina",
    description: "Carga comprobantes y consulta movimientos.",
    grants: [
      ...only(["vouchers"], ["view", "create"], "all"),
      ...only(["movements"], ["view"], "all"),
    ],
  },
  {
    key: "content-editor",
    name: "Editor de contenido",
    description: "Edita el sitio público y los perfiles de ministerio.",
    grants: [
      ...every("content", "all"),
      ...only(["ministries.profile"], ["view", "edit"], "all"),
    ],
  },
];
