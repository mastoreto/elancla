import type { RoleDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../../core/context";
import { listRoleRows } from "../../data";
import { toRoleDto } from "../../mappers";

export async function listRoles(ctx: AuthenticatedContext): Promise<RoleDto[]> {
  return (await listRoleRows(ctx.organizationId)).map(toRoleDto);
}
