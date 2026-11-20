import { scopeOf } from "../../../../core/authz";
import type { Access } from "../../../../core/context";
import type {
  EditorialPermissionKind,
  EditorialTypeDefinition,
} from "../../registry";

/**
 * Whether the access holds the permission this kind of action needs on this content type. For a
 * ministry-scoped type, a grant with `ministry` scope only reaches the user's own ministries.
 */
export function hasEditorialPermission(
  access: Access,
  definition: EditorialTypeDefinition,
  kind: EditorialPermissionKind,
  entityId: string,
): boolean {
  const scope = scopeOf(access, definition.permissions[kind]);
  if (scope === null) return false;
  if (definition.ministryScoped && scope === "ministry") {
    return access.ministryIds.includes(entityId);
  }
  return true;
}
