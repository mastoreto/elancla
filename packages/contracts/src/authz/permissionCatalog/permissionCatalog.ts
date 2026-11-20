/** Single source of truth for what can be granted. Shared by the API and the CRM. */

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "approve",
  "delete",
  "publish",
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
  /** The resource as stored in `RolePermission` rows and sent in DTOs (never changes). */
  resource: string;
  actions: readonly PermissionAction[];
  scopes: readonly PermissionScope[];
  /** Actions that let their holder control access (grant roles, invite, change settings). */
  dangerous?: readonly PermissionAction[];
}

const CRUD = ["view", "create", "edit", "delete"] as const;
const WITH_APPROVAL = ["view", "create", "edit", "approve", "delete"] as const;
const CRUD_AND_PUBLISH = [...CRUD, "publish"] as const;
const ALL_ONLY = ["all"] as const;
const MINISTRY_OR_ALL = ["ministry", "all"] as const;
const OWN_MINISTRY_OR_ALL = ["own", "ministry", "all"] as const;

/**
 * Keys are code identifiers (`ministryProfile`); `resource` is the wire value. Reference a
 * permission only through `PERMISSIONS`, never by writing its string.
 */
export const PERMISSION_CATALOG = {
  movements: {
    resource: "movements",
    actions: WITH_APPROVAL,
    scopes: ALL_ONLY,
  },
  requests: {
    resource: "requests",
    actions: WITH_APPROVAL,
    scopes: OWN_MINISTRY_OR_ALL,
  },
  vouchers: {
    resource: "vouchers",
    actions: WITH_APPROVAL,
    scopes: OWN_MINISTRY_OR_ALL,
  },
  projects: {
    resource: "projects",
    actions: WITH_APPROVAL,
    scopes: OWN_MINISTRY_OR_ALL,
  },
  // A budget belongs to a ministry, so the leader of one can see its own.
  budgets: {
    resource: "budgets",
    actions: WITH_APPROVAL,
    scopes: MINISTRY_OR_ALL,
  },
  voting: { resource: "voting", actions: CRUD, scopes: ALL_ONLY },
  reports: { resource: "reports", actions: CRUD, scopes: ALL_ONLY },
  content: { resource: "content", actions: CRUD, scopes: ALL_ONLY },
  // Posts are published through the editorial workflow (see the editorial module).
  blogPosts: {
    resource: "content.posts",
    actions: CRUD_AND_PUBLISH,
    scopes: ALL_ONLY,
  },
  // Institutional site data: edited directly, with its own permission and audit (not editorial).
  site: { resource: "site", actions: ["view", "edit"], scopes: ALL_ONLY },
  people: { resource: "content.people", actions: CRUD, scopes: ALL_ONLY },
  visit: {
    resource: "content.visit",
    actions: ["view", "edit"],
    scopes: ALL_ONLY,
  },
  // Simple pages go through the editorial workflow.
  pages: {
    resource: "content.pages",
    actions: CRUD_AND_PUBLISH,
    scopes: ALL_ONLY,
  },
  ministryProfile: {
    resource: "ministries.profile",
    actions: CRUD_AND_PUBLISH,
    scopes: MINISTRY_OR_ALL,
  },
  ministryFinance: {
    resource: "ministries.finance",
    actions: CRUD,
    scopes: MINISTRY_OR_ALL,
  },
  users: {
    resource: "users",
    actions: CRUD,
    scopes: ALL_ONLY,
    dangerous: ["create", "edit", "delete"],
  },
  roles: {
    resource: "roles",
    actions: CRUD,
    scopes: ALL_ONLY,
    dangerous: ["create", "edit", "delete"],
  },
  invitations: {
    resource: "invitations",
    actions: CRUD,
    scopes: ALL_ONLY,
    dangerous: ["create", "delete"],
  },
  // Rotating a key is create-new + revoke-old, so there is no `edit`.
  siteKeys: {
    resource: "site.keys",
    actions: ["view", "create", "delete"],
    scopes: ALL_ONLY,
    dangerous: ["create", "delete"],
  },
  // Reading the trail is a power of its own: it shows who did what, and to whom.
  audit: { resource: "audit", actions: ["view"], scopes: ALL_ONLY },
  // Who reviews what is configured in editorial settings; this only guards that screen.
  editorial: {
    resource: "editorial",
    actions: ["view", "edit"],
    scopes: ALL_ONLY,
    dangerous: ["edit"],
  },
  settings: {
    resource: "settings",
    actions: ["view", "edit"],
    scopes: ALL_ONLY,
    dangerous: ["edit"],
  },
} as const satisfies Record<string, ResourceDefinition>;

type Catalog = typeof PERMISSION_CATALOG;

/** Code identifier of a catalog entry (`movements`, `ministryProfile`...). */
export type PermissionKey = keyof Catalog;

/** The wire resource (`"ministries.profile"`), as stored and sent in DTOs. */
export type PermissionResource = Catalog[PermissionKey]["resource"];

type PermissionsOf = {
  readonly [Key in PermissionKey]: {
    readonly [Action in Catalog[Key]["actions"][number]]: `${Catalog[Key]["resource"]}:${Action}`;
  };
};

/** Every real `resource:action` pair; `"settings:create"` is not one of them. */
export type Permission = {
  [Key in PermissionKey]: PermissionsOf[Key][keyof PermissionsOf[Key]];
}[PermissionKey];

function buildPermissions(): PermissionsOf {
  const entries = Object.entries(PERMISSION_CATALOG).map(
    ([key, definition]) => [
      key,
      Object.freeze(
        Object.fromEntries(
          definition.actions.map((action) => [
            action,
            `${definition.resource}:${action}`,
          ]),
        ),
      ),
    ],
  );
  return Object.freeze(Object.fromEntries(entries)) as PermissionsOf;
}

/**
 * The only way to name a permission in code: `PERMISSIONS.movements.view`,
 * `PERMISSIONS.ministryProfile.edit`. Only the actions the catalog allows exist.
 */
export const PERMISSIONS: PermissionsOf = buildPermissions();

const DEFINITION_BY_RESOURCE = Object.fromEntries(
  Object.values(PERMISSION_CATALOG).map((definition) => [
    definition.resource,
    definition,
  ]),
) as unknown as Record<PermissionResource, ResourceDefinition>;

export const PERMISSION_RESOURCES: PermissionResource[] = Object.values(
  PERMISSION_CATALOG,
).map((definition) => definition.resource);

export interface PermissionGrant {
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
}

export function toPermission(
  resource: PermissionResource,
  action: PermissionAction,
): Permission {
  // Callers pass a pair taken from the catalog; arbitrary pairs are not permissions.
  return `${resource}:${action}` as Permission;
}

/** A grant of one catalog permission with its scope: `grant(PERMISSIONS.requests.view, "ministry")`. */
export function grant(
  permission: Permission,
  scope: PermissionScope = "all",
): PermissionGrant {
  return { ...fromPermission(permission), scope };
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
  return [...DEFINITION_BY_RESOURCE[resource].actions];
}

export function scopesOf(resource: PermissionResource): PermissionScope[] {
  return [...DEFINITION_BY_RESOURCE[resource].scopes];
}

/** Whether holding this permission lets someone escalate or control access. */
export function isDangerousPermission(
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  const definition: ResourceDefinition = DEFINITION_BY_RESOURCE[resource];
  return definition.dangerous?.includes(action) ?? false;
}

/** Whether the catalog allows this exact resource, action and scope combination. */
export function isGrantSupported(grant: PermissionGrant): boolean {
  const definition: ResourceDefinition | undefined =
    DEFINITION_BY_RESOURCE[grant.resource];
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
