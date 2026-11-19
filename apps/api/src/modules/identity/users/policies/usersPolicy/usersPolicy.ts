import type { Access } from "../../../../../core/context";
import { ConflictError, ForbiddenError } from "../../../../../core/errors";

/** Nobody changes their own roles or ministries: it would be a way to elevate themselves. */
export function assertNotSelf(actorId: string, targetId: string): void {
  if (actorId === targetId) {
    throw new ForbiddenError("You cannot change your own roles or ministries");
  }
}

interface AdminRoleChange {
  access: Pick<Access, "isAdmin">;
  adminRoleId: string | null;
  hadAdminRole: boolean;
  keepsAdminRole: boolean;
  /** Members of the admin role right now. */
  adminCount: number;
}

/**
 * Only an admin grants or removes the admin role, and the last admin can never lose it, so the
 * organization is never left without one.
 */
export function assertAdminRoleChangeAllowed(change: AdminRoleChange): void {
  const changes = change.hadAdminRole !== change.keepsAdminRole;
  if (!changes) return;
  if (!change.access.isAdmin) {
    throw new ForbiddenError(
      "Only an admin can grant or remove the admin role",
    );
  }
  if (change.hadAdminRole && !change.keepsAdminRole && change.adminCount <= 1) {
    throw new ConflictError("The last admin cannot lose the admin role");
  }
}
