import {
  AUDIT_ACTIONS,
  type PersonProfileDto,
  type UpsertPersonProfileBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { ConflictError, NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { findPersonRow, isUniqueViolation, replacePersonRow } from "../../data";
import { toPersonProfileDto } from "../../mappers";
import { validatePersonReferences } from "../validatePersonReferences";

export async function updatePerson(
  ctx: AuthenticatedContext,
  id: string,
  body: UpsertPersonProfileBody,
): Promise<PersonProfileDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  try {
    return await withTransaction(db, async (tx) => {
      const current = await findPersonRow(tx, ctx.organizationId, id);
      if (!current) throw new NotFoundError("The person was not found");
      await validatePersonReferences(tx, {
        organizationId: ctx.organizationId,
        body,
        exceptId: id,
      });
      const updated = await replacePersonRow(tx, ctx.organizationId, id, body);
      const after = toPersonProfileDto(updated, publicBaseUrl);
      await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
        action: AUDIT_ACTIONS.personProfile.updated,
        entity: { type: "personProfile", id },
        before: toPersonProfileDto(current, publicBaseUrl),
        after,
        metadata: { entityLabel: updated.name },
      });
      return after;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("That user already has a profile");
    }
    throw error;
  }
}
