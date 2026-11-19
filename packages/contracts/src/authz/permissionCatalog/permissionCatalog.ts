/** Single source of truth for what can be granted. Shared by the API and the CRM. */

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "approve",
  "delete",
] as const;

export const PERMISSION_SCOPES = ["own", "ministry", "all"] as const;

/** Widest last: `all` beats `ministry` beats `own` when roles are merged. */
export const SCOPE_BREADTH: Record<PermissionScope, number> = {
  own: 0,
  ministry: 1,
  all: 2,
};

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

interface ResourceDefinition {
  actions: readonly PermissionAction[];
  scopes: readonly PermissionScope[];
  /** Actions that let their holder control access (grant roles, invite, change settings). */
  dangerous?: readonly PermissionAction[];
}

const CRUD: readonly PermissionAction[] = ["view", "create", "edit", "delete"];
const WITH_APPROVAL: readonly PermissionAction[] = PERMISSION_ACTIONS;
const ALL_ONLY: readonly PermissionScope[] = ["all"];
const MINISTRY_OR_ALL: readonly PermissionScope[] = ["ministry", "all"];
const OWN_MINISTRY_OR_ALL: readonly PermissionScope[] = [
  "own",
  "ministry",
  "all",
];

export const PERMISSION_CATALOG = {
  movements: { actions: WITH_APPROVAL, scopes: ALL_ONLY },
  requests: { actions: WITH_APPROVAL, scopes: OWN_MINISTRY_OR_ALL },
  vouchers: { actions: WITH_APPROVAL, scopes: OWN_MINISTRY_OR_ALL },
  projects: { actions: WITH_APPROVAL, scopes: OWN_MINISTRY_OR_ALL },
  // A budget belongs to a ministry, so the leader of one can see its own.
  budgets: { actions: WITH_APPROVAL, scopes: MINISTRY_OR_ALL },
  voting: { actions: CRUD, scopes: ALL_ONLY },
  reports: { actions: CRUD, scopes: ALL_ONLY },
  content: { actions: CRUD, scopes: ALL_ONLY },
  "ministries.profile": { actions: CRUD, scopes: MINISTRY_OR_ALL },
  "ministries.finance": { actions: CRUD, scopes: MINISTRY_OR_ALL },
  users: {
    actions: CRUD,
    scopes: ALL_ONLY,
    dangerous: ["create", "edit", "delete"],
  },
  roles: {
    actions: CRUD,
    scopes: ALL_ONLY,
    dangerous: ["create", "edit", "delete"],
  },
  invitations: {
    actions: CRUD,
    scopes: ALL_ONLY,
    dangerous: ["create", "delete"],
  },
  settings: {
    actions: ["view", "edit"],
    scopes: ALL_ONLY,
    dangerous: ["edit"],
  },
} as const satisfies Record<string, ResourceDefinition>;

export type PermissionResource = keyof typeof PERMISSION_CATALOG;

export const PERMISSION_RESOURCES = Object.keys(
  PERMISSION_CATALOG,
) as PermissionResource[];

export type Permission = `${PermissionResource}:${PermissionAction}`;

export interface PermissionGrant {
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
}

export function toPermission(
  resource: PermissionResource,
  action: PermissionAction,
): Permission {
  return `${resource}:${action}`;
}

/** Inverse of `toPermission`. A `Permission` is always built from a valid resource and action. */
export function fromPermission(permission: Permission): {
  resource: PermissionResource;
  action: PermissionAction;
} {
  const [resource, action] = permission.split(":") as [
    PermissionResource,
    PermissionAction,
  ];
  return { resource, action };
}

export function actionsOf(resource: PermissionResource): PermissionAction[] {
  return [...PERMISSION_CATALOG[resource].actions];
}

export function scopesOf(resource: PermissionResource): PermissionScope[] {
  return [...PERMISSION_CATALOG[resource].scopes];
}

/** Whether holding this permission lets someone escalate or control access. */
export function isDangerousPermission(
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  const definition: ResourceDefinition = PERMISSION_CATALOG[resource];
  return definition.dangerous?.includes(action) ?? false;
}

/** Whether the catalog allows this exact resource, action and scope combination. */
export function isGrantSupported(grant: PermissionGrant): boolean {
  const definition: ResourceDefinition | undefined =
    PERMISSION_CATALOG[grant.resource];
  if (!definition) return false;
  return (
    definition.actions.includes(grant.action) &&
    definition.scopes.includes(grant.scope)
  );
}

/** The widest of two scopes. */
export function widerScope(
  left: PermissionScope,
  right: PermissionScope,
): PermissionScope {
  return SCOPE_BREADTH[left] >= SCOPE_BREADTH[right] ? left : right;
}
