import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { findPlaceRow, isPlaceInUse, softDeletePlace } from "../../data";
import { PlaceInUseError } from "../../domain";
import { toPlaceDto } from "../../mappers";

/** Logical delete. A place an activity points at cannot go (409 `place_in_use`). */
export function deletePlace(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findPlaceRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The place was not found");
    if (await isPlaceInUse(tx, ctx.organizationId, id)) {
      throw new PlaceInUseError();
    }
    await softDeletePlace(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.place.deleted,
      entity: { type: "place", id },
      before: toPlaceDto(current),
    });
  });
}
