import type {
  EventDto,
  EventVisibility as EventVisibilityDto,
} from "@ancla/contracts";
import type { EventVisibility } from "@ancla/db";
import type { EventRow } from "../../data";

const VISIBILITIES: Record<EventVisibility, EventVisibilityDto> = {
  PUBLIC: "public",
  INTERNAL: "internal",
};

export const toVisibilityDto = (
  visibility: EventVisibility,
): EventVisibilityDto => VISIBILITIES[visibility];

export function toEventDto(row: EventRow): EventDto {
  return {
    id: row.id,
    year: row.year,
    visibility: toVisibilityDto(row.visibility),
    audienceRoleIds: row.audienceRoles.map(({ roleId }) => roleId),
    needsReview: row.needsReview,
    sequence: row.sequence,
    version: row.version,
  };
}
