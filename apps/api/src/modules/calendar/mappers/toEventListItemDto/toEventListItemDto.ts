import type { EventListItemDto, EventSnapshot } from "@ancla/contracts";
import type { EventRow } from "../../data";
import { toVisibilityDto } from "../toEventDto";

/** The revisions of an event the list looks at: the one being edited and the one the site shows. */
export interface EventRevisions {
  working: { state: string; snapshot: unknown } | null;
  live: { state: string; snapshot: unknown } | null;
}

const asSnapshot = (value: unknown): Partial<EventSnapshot> =>
  value as Partial<EventSnapshot>;

/**
 * A row of the CRM list. The content shown is the working revision's when there is one (what the
 * editor is about to publish) and the live one's otherwise.
 */
export function toEventListItemDto(
  row: EventRow,
  { working, live }: EventRevisions,
): EventListItemDto {
  const current = working ?? live;
  const snapshot = current ? asSnapshot(current.snapshot) : null;
  return {
    id: row.id,
    year: row.year,
    visibility: toVisibilityDto(row.visibility),
    audienceRoleIds: row.audienceRoles.map(({ roleId }) => roleId),
    needsReview: row.needsReview,
    sequence: row.sequence,
    version: row.version,
    editorialState: current
      ? (current.state.toLowerCase() as EventListItemDto["editorialState"])
      : null,
    isLive: live?.state === "PUBLISHED",
    titles: Object.fromEntries(
      Object.entries(snapshot?.translations ?? {}).map(
        ([locale, translation]) => [locale, translation.title],
      ),
    ),
    startDate: snapshot?.startDate ?? null,
    startTime: snapshot?.startTime ?? null,
    endDate: snapshot?.endDate ?? null,
    allDay: snapshot?.allDay ?? false,
    status: snapshot?.status ?? null,
    ministryIds: snapshot?.ministryIds ?? [],
  };
}
