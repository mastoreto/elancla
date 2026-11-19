import {
  AUDIT_ACTIONS,
  type SetUserMinistriesBody,
  type UserDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { NotFoundError, ValidationError } from "../../../../../core/errors";
import {
  findExistingMinistryIds,
  findUserMinistrySummaries,
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
  const target = await findUserRow(userId);
  if (!target) throw new NotFoundError("The user was not found");

  const ministryIds = [...new Set(body.ministryIds)];
  const existing = new Set(
    await findExistingMinistryIds(ctx.organizationId, ministryIds),
  );
  if (!ministryIds.every((id) => existing.has(id))) {
    throw new ValidationError("The request is not valid", [
      { path: "ministryIds", message: "Contains an id that does not exist" },
    ]);
  }

  await withTransaction(db, async (tx) => {
    const before = await findUserMinistrySummaries(tx, userId);
    await replaceUserMinistries(tx, userId, ministryIds);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.user.ministriesChanged,
      entity: { type: "user", id: userId },
      before: { ministries: before },
      after: { ministries: await findUserMinistrySummaries(tx, userId) },
      metadata: { entityLabel: target.email },
    });
  });

  const row = await findUserRow(userId);
  if (!row) throw new NotFoundError("The user was not found");
  return toUserDto(row);
}
