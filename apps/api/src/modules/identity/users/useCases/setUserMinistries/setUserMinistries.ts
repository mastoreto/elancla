import type { SetUserMinistriesBody, UserDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../../core/context";
import { NotFoundError, ValidationError } from "../../../../../core/errors";
import {
  findExistingMinistryIds,
  findUserRow,
  replaceUserMinistries,
} from "../../data";
import { toUserDto } from "../../mappers";
import { assertNotSelf } from "../../policies";

interface SetUserMinistriesInput {
  ctx: AuthenticatedContext;
  userId: string;
  body: SetUserMinistriesBody;
}

/** Replaces the ministries of a user (what the `ministry` scope resolves against). */
export async function setUserMinistries({
  ctx,
  userId,
  body,
}: SetUserMinistriesInput): Promise<UserDto> {
  assertNotSelf(ctx.user.id, userId);
  if (!(await findUserRow(userId)))
    throw new NotFoundError("The user was not found");

  const ministryIds = [...new Set(body.ministryIds)];
  const existing = new Set(
    await findExistingMinistryIds(ctx.organizationId, ministryIds),
  );
  if (!ministryIds.every((id) => existing.has(id))) {
    throw new ValidationError("The request is not valid", [
      { path: "ministryIds", message: "Contains an id that does not exist" },
    ]);
  }

  // ponytail: 0.5 adds `writeAudit(tx, ...)` here, inside the same transaction.
  await replaceUserMinistries(userId, ministryIds);

  const row = await findUserRow(userId);
  if (!row) throw new NotFoundError("The user was not found");
  return toUserDto(row);
}
