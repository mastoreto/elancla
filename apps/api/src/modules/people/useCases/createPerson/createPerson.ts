import {
  AUDIT_ACTIONS,
  type PersonProfileDto,
  type UpsertPersonProfileBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { ConflictError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { createPersonRow, isUniqueViolation } from "../../data";
import { toPersonProfileDto } from "../../mappers";
import { validatePersonReferences } from "../validatePersonReferences";

export async function createPerson(
  ctx: AuthenticatedContext,
  body: UpsertPersonProfileBody,
): Promise<PersonProfileDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  try {
    return await withTransaction(db, async (tx) => {
      await validatePersonReferences(tx, {
        organizationId: ctx.organizationId,
        body,
      });
      const created = await createPersonRow(tx, ctx.organizationId, body);
      const after = toPersonProfileDto(created, publicBaseUrl);
      await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
        action: AUDIT_ACTIONS.personProfile.created,
        entity: { type: "personProfile", id: created.id },
        after,
        metadata: { entityLabel: created.name },
      });
      return after;
    });
  } catch (error) {
    // Two concurrent requests linking the same user: the unique key decides.
    if (isUniqueViolation(error)) {
      throw new ConflictError("That user already has a profile");
    }
    throw error;
  }
}
