import {
  grant,
  PERMISSIONS,
  type Permission,
  type PermissionGrant,
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

/** Every action a resource allows, all with the same scope ("todo"). */
function everyAction(
  actions: Readonly<Record<string, Permission>>,
  scope: PermissionScope,
): PermissionGrant[] {
  return Object.values(actions).map((permission) => grant(permission, scope));
}

const TREASURY = [
  PERMISSIONS.movements,
  PERMISSIONS.requests,
  PERMISSIONS.vouchers,
  PERMISSIONS.budgets,
  PERMISSIONS.projects,
  PERMISSIONS.ministryFinance,
];

/** The ESRE roles (plus the content editor) the seed creates. All remain editable afterwards. */
export const SYSTEM_ROLE_PRESETS: readonly SystemRolePreset[] = [
  {
    key: "treasurer",
    name: "Tesorero",
    description:
      "Gestiona movimientos, comprobantes, solicitudes y presupuestos.",
    grants: [...TREASURY, PERMISSIONS.reports].flatMap((resource) =>
      everyAction(resource, "all"),
    ),
  },
  {
    key: "auditor",
    name: "Síndico",
    description: "Revisa toda la tesorería y los informes, sin modificar nada.",
    grants: [
      ...[...TREASURY, PERMISSIONS.reports].map((resource) =>
        grant(resource.view, "all"),
      ),
      grant(PERMISSIONS.audit.view, "all"),
    ],
  },
  {
    key: "board",
    name: "Directiva",
    description:
      "Supervisa la tesorería, aprueba solicitudes y gestiona proyectos.",
    grants: [
      ...[...TREASURY, PERMISSIONS.reports].map((resource) =>
        grant(resource.view, "all"),
      ),
      grant(PERMISSIONS.projects.create, "all"),
      grant(PERMISSIONS.projects.edit, "all"),
      grant(PERMISSIONS.requests.approve, "all"),
    ],
  },
  {
    key: "pastoral",
    name: "Pastoral",
    description:
      "Acompaña a los ministerios y consulta solicitudes e informes.",
    grants: [
      grant(PERMISSIONS.ministryProfile.view, "all"),
      grant(PERMISSIONS.requests.view, "all"),
      grant(PERMISSIONS.reports.view, "all"),
    ],
  },
  {
    key: "leader",
    name: "Líder",
    description: "Pide fondos y consulta el presupuesto de su ministerio.",
    grants: [
      grant(PERMISSIONS.requests.view, "ministry"),
      grant(PERMISSIONS.requests.create, "ministry"),
      grant(PERMISSIONS.requests.edit, "ministry"),
      grant(PERMISSIONS.budgets.view, "ministry"),
      grant(PERMISSIONS.ministryFinance.view, "ministry"),
      grant(PERMISSIONS.ministryProfile.view, "ministry"),
      grant(PERMISSIONS.ministryProfile.edit, "ministry"),
    ],
  },
  {
    key: "assembly",
    name: "Asamblea",
    description: "Consulta informes y participa de las votaciones.",
    grants: [
      grant(PERMISSIONS.reports.view, "all"),
      grant(PERMISSIONS.voting.view, "all"),
    ],
  },
  {
    key: "office",
    name: "Oficina",
    description: "Carga comprobantes y consulta movimientos.",
    grants: [
      grant(PERMISSIONS.vouchers.view, "all"),
      grant(PERMISSIONS.vouchers.create, "all"),
      grant(PERMISSIONS.movements.view, "all"),
    ],
  },
  {
    key: "content-editor",
    name: "Editor de contenido",
    description: "Edita el sitio público y los perfiles de ministerio.",
    grants: [
      ...everyAction(PERMISSIONS.content, "all"),
      ...everyAction(PERMISSIONS.blogPosts, "all"),
      ...everyAction(PERMISSIONS.site, "all"),
      ...everyAction(PERMISSIONS.people, "all"),
      ...everyAction(PERMISSIONS.visit, "all"),
      ...everyAction(PERMISSIONS.pages, "all"),
      grant(PERMISSIONS.ministryProfile.view, "all"),
      grant(PERMISSIONS.ministryProfile.edit, "all"),
      grant(PERMISSIONS.ministryProfile.publish, "all"),
    ],
  },
];
