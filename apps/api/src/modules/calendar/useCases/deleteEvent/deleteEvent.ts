import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  canSeeEvent,
  changeRevision,
  findLiveRevision,
  findWorkingRevision,
} from "../../../editorial";
import { deleteEventRow, findEventRow } from "../../data";
import { EventLiveError } from "../../domain";
import { toEventDto } from "../../mappers";

/**
 * Deletes an event that was never published. One with a live revision (published or paused) is
 * already known to the public site and to calendar clients, so it is cancelled instead (409
 * `event_live`). A draft left behind is retired (`SUPERSEDED`), so it never reaches the inbox
 * of a row that no longer exists; the history is not deleted.
 */
export function deleteEvent(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  return withTransaction(db, async (tx) => {
    const current = await findEventRow(tx, ctx.organizationId, id);
    if (
      !current ||
      !canSeeEvent(ctx.access, {
        visibility: current.visibility,
        audienceRoleIds: current.audienceRoles.map(({ roleId }) => roleId),
      })
    ) {
      throw new NotFoundError("The event was not found");
    }
    const key = {
      organizationId: ctx.organizationId,
      contentType: "EVENT",
      entityId: id,
    } as const;
    if (await findLiveRevision(tx, key)) throw new EventLiveError();

    const working = await findWorkingRevision(tx, key);
    if (working) {
      await changeRevision(tx, {
        organizationId: ctx.organizationId,
        id: working.id,
        from: [working.state],
        data: { state: "SUPERSEDED" },
      });
    }
    await deleteEventRow(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.event.deleted,
      entity: { type: "event", id },
      before: toEventDto(current),
    });
  });
}
