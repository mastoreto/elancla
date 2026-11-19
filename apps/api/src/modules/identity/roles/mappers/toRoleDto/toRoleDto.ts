import type { RoleDto } from "@ancla/contracts";
import { toPermissionGrants } from "../../../../../core/authz";
import type { RoleRow } from "../../data";

export function toRoleDto(row: RoleRow): RoleDto {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    persistentSession: row.persistentSession,
    maxSessionSeconds: row.maxSessionSeconds,
    memberCount: row._count.members,
    grants: toPermissionGrants(row.permissions),
  };
}
