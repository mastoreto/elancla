import {
  AUDIT_ACTIONS,
  type PlaceDto,
  type UpdatePlaceBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import { assertTranslationLocales } from "../../../ministries";
import { findPlaceRow, replacePlaceIfVersion } from "../../data";
import { toPlaceDto } from "../../mappers";

/** Replaces the fields and the translations; `version` is the one the editor loaded. */
export function updatePlace(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: UpdatePlaceBody,
): Promise<PlaceDto> {
  return withTransaction(db, async (tx) => {
    const current = await findPlaceRow(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The place was not found");
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);

    const applied = await replacePlaceIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findPlaceRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError("The place was not found");
    const after = toPlaceDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.place.updated,
      entity: { type: "place", id },
      before: toPlaceDto(current),
      after,
    });
    return after;
  });
}
