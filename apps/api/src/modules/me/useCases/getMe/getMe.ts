import type { MeDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../core/context";
import { UnauthenticatedError } from "../../../../core/errors";
import { findAccountSnapshot } from "../../data";
import { toMeDto } from "../../mappers";

export async function getMe(ctx: AuthenticatedContext): Promise<MeDto> {
  const snapshot = await findAccountSnapshot(ctx.user.id);
  // The session outlived its user (deleted between the session check and here).
  if (!snapshot) throw new UnauthenticatedError();
  return toMeDto(ctx.user, snapshot);
}
