import { ADMIN_ROLE_KEY } from "@ancla/contracts";
import type { Access } from "../../../../../core/context";
import { ConflictError, ForbiddenError } from "../../../../../core/errors";

interface PolicyRole {
  id: string;
  key: string | null;
  memberCount: number;
}

/**
 * Managing roles is admin-only for now, even if a custom role grants `roles:create|edit|delete`:
 * a role grid is the widest way to hand out access.
 */
export function assertCanManageRoles(access: Pick<Access, "isAdmin">): void {
  if (!access.isAdmin)
    throw new ForbiddenError("Only an admin can manage roles");
}

/**
 * The admin role is fixed (implicit full access), and nobody edits a role they hold: that would let
 * anyone grant themselves more through the grid.
 */
export function assertRoleEditable(
  access: Pick<Access, "roles">,
  role: PolicyRole,
): void {
  if (role.key === ADMIN_ROLE_KEY) {
    throw new ForbiddenError("The admin role cannot be changed");
  }
  if (access.roles.some((held) => held.id === role.id)) {
    throw new ForbiddenError("You cannot edit a role you hold");
  }
}

/** Seeded roles can be edited but not deleted; a role with members must be emptied first. */
export function assertRoleDeletable(
  access: Pick<Access, "roles">,
  role: PolicyRole,
): void {
  assertRoleEditable(access, role);
  if (role.key !== null) {
    throw new ConflictError("Seeded roles can be edited but not deleted");
  }
  if (role.memberCount > 0) {
    throw new ConflictError("The role still has members; reassign them first");
  }
}
