import type { EventListDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../core/context";
import { canSeeEvent, listCurrentRevisionRows } from "../../../editorial";
import { listEventRows } from "../../data";
import { type EventRevisions, toEventListItemDto } from "../../mappers";

const LIVE_STATES = ["PUBLISHED", "PAUSED"];

/**
 * The events of a year the user may see: public ones, and the internal ones of their audience (the
 * admin sees all). The "when" and the titles come from the current revision of each event.
 */
export async function listEvents(
  ctx: AuthenticatedContext,
  year: number,
): Promise<EventListDto> {
  const [rows, revisions] = await Promise.all([
    listEventRows(ctx.organizationId, year),
    listCurrentRevisionRows(ctx.organizationId, "EVENT"),
  ]);
  const byEvent = new Map<string, EventRevisions>();
  for (const revision of revisions) {
    const current = byEvent.get(revision.entityId) ?? {
      working: null,
      live: null,
    };
    if (LIVE_STATES.includes(revision.state)) current.live = revision;
    else current.working = revision;
    byEvent.set(revision.entityId, current);
  }
  const items = rows
    .filter((row) =>
      canSeeEvent(ctx.access, {
        visibility: row.visibility,
        audienceRoleIds: row.audienceRoles.map(({ roleId }) => roleId),
      }),
    )
    .map((row) =>
      toEventListItemDto(
        row,
        byEvent.get(row.id) ?? { working: null, live: null },
      ),
    );
  return { items };
}
