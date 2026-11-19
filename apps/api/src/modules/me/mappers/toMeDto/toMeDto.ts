import type { MeDto } from "@ancla/contracts";
import type { SessionUser } from "../../../../core/context";

/** Explicit field list: anything else on the session user never reaches the response. */
export function toMeDto(user: SessionUser): MeDto {
  return { id: user.id, name: user.name, email: user.email };
}
