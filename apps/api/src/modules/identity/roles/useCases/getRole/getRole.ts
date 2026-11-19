import type { RoleDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../../core/context";
import { NotFoundError } from "../../../../../core/errors";
import { findRoleRow } from "../../data";
import { toRoleDto } from "../../mappers";

export async function getRole(
  ctx: AuthenticatedContext,
  id: string,
): Promise<RoleDto> {
  const row = await findRoleRow(ctx.organizationId, id);
  if (!row) throw new NotFoundError("The role was not found");
  return toRoleDto(row);
}
