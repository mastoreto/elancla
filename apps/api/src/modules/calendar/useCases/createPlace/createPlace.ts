import {
  AUDIT_ACTIONS,
  type PlaceDto,
  type UpsertPlaceBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { assertTranslationLocales } from "../../../ministries";
import { createPlaceRow } from "../../data";
import { toPlaceDto } from "../../mappers";

export function createPlace(
  ctx: AuthenticatedContext,
  body: UpsertPlaceBody,
): Promise<PlaceDto> {
  return withTransaction(db, async (tx) => {
    await assertTranslationLocales(tx, ctx.organizationId, body.translations);
    const created = toPlaceDto(
      await createPlaceRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.place.created,
      entity: { type: "place", id: created.id },
      after: created,
    });
    return created;
  });
}
