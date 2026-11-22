import {
  AUDIT_ACTIONS,
  type EventDto,
  type EventSettingsBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { StaleVersionError } from "../../../blog";
import { canSeeEvent } from "../../../editorial";
import { findEventRow, replaceEventSettingsIfVersion } from "../../data";
import { toEventDto } from "../../mappers";
import { assertAudienceRoles } from "../assertAudienceRoles";

const NOT_FOUND = "The event was not found";

/** Direct (not editorial) visibility and audience; `version` is the one the editor loaded. */
export function updateEventSettings(
  ctx: AuthenticatedContext,
  id: string,
  { version, ...body }: EventSettingsBody,
): Promise<EventDto> {
  return withTransaction(db, async (tx) => {
    const current = await findEventRow(tx, ctx.organizationId, id);
    // An internal event is a 404 for whoever is not in its audience, like in the editorial routes.
    if (
      !current ||
      !canSeeEvent(ctx.access, {
        visibility: current.visibility,
        audienceRoleIds: current.audienceRoles.map(({ roleId }) => roleId),
      })
    ) {
      throw new NotFoundError(NOT_FOUND);
    }
    await assertAudienceRoles(tx, ctx.organizationId, body.audienceRoleIds);

    const applied = await replaceEventSettingsIfVersion(
      tx,
      { id, organizationId: ctx.organizationId, version },
      body,
    );
    if (!applied) throw new StaleVersionError();

    const updated = await findEventRow(tx, ctx.organizationId, id);
    if (!updated) throw new NotFoundError(NOT_FOUND);
    const after = toEventDto(updated);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.event.settingsUpdated,
      entity: { type: "event", id },
      before: toEventDto(current),
      after,
    });
    return after;
  });
}
