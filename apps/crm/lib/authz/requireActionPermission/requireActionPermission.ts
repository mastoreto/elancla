import type { Permission } from "@ancla/contracts";
import { can } from "../can";
import { getAccess } from "../getAccess";

export class UnauthorizedActionError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedActionError";
  }
}

/**
 * Server Actions are public HTTP endpoints, so each one authorizes itself; the layout guard does
 * not cover them. Throws unless the signed-in user holds the permission.
 */
export async function requireActionPermission(permission: Permission): Promise<void> {
  const access = await getAccess();
  if (!(access && can(access, permission))) throw new UnauthorizedActionError();
}
