export {
  actionsOf,
  fromPermission,
  grant,
  isDangerousPermission,
  isGrantSupported,
  PERMISSION_ACTIONS,
  PERMISSION_CATALOG,
  PERMISSION_RESOURCES,
  PERMISSION_SCOPES,
  PERMISSIONS,
  type Permission,
  type PermissionAction,
  type PermissionGrant,
  type PermissionKey,
  type PermissionResource,
  type PermissionScope,
  SCOPE_BREADTH,
  scopesOf,
  toPermission,
  widerScope,
} from "./permissionCatalog";
export {
  permissionGrantSchema,
  permissionGrantsSchema,
} from "./permissionGrant";
export {
  ADMIN_ROLE,
  ADMIN_ROLE_KEY,
  SYSTEM_ROLE_PRESETS,
  type SystemRolePreset,
} from "./systemRolePresets";
