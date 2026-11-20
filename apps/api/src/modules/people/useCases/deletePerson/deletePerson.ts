import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { deletePersonRow, findPersonRow } from "../../data";
import { toPersonProfileDto } from "../../mappers";

/** A real delete: the roles and their translations go with the profile in cascade. */
export async function deletePerson(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  await withTransaction(db, async (tx) => {
    const current = await findPersonRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The person was not found");
    await deletePersonRow(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.personProfile.deleted,
      entity: { type: "personProfile", id },
      before: toPersonProfileDto(current, publicBaseUrl),
      metadata: { entityLabel: current.name },
    });
  });
}
