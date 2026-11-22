import {
  AUDIT_ACTIONS,
  type CreateEventBody,
  type EventDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { createEventRow } from "../../data";
import { toEventDto } from "../../mappers";
import { assertAudienceRoles } from "../assertAudienceRoles";

/**
 * Creates the row of an event (year, visibility, audience). What the event says goes in afterwards
 * through the editorial draft, so a year has to be chosen up front: its date must fall in it.
 */
export function createEvent(
  ctx: AuthenticatedContext,
  body: CreateEventBody,
): Promise<EventDto> {
  return withTransaction(db, async (tx) => {
    await assertAudienceRoles(tx, ctx.organizationId, body.audienceRoleIds);
    const created = toEventDto(
      await createEventRow(tx, ctx.organizationId, body),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.event.created,
      entity: { type: "event", id: created.id },
      after: created,
    });
    return created;
  });
}
