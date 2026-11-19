import type { MeDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../core/context";
import { toMeDto } from "../../mappers";

export function getMe(ctx: AuthenticatedContext): MeDto {
  return toMeDto(ctx.user);
}
