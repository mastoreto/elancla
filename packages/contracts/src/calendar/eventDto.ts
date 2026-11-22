import { z } from "zod";
import { editorialStateDto } from "../editorial";
import {
  calendarDate,
  calendarYearNumber,
  EVENT_AUDIENCE_ROLES_MAX_COUNT,
  EVENT_STATUSES,
  EVENT_VISIBILITIES,
  type EventVisibility,
  timeOfDay,
  versionField,
} from "./calendarConstants";

const visibility = z.enum(EVENT_VISIBILITIES);
const audienceRoleIds = z
  .array(z.uuid())
  .max(EVENT_AUDIENCE_ROLES_MAX_COUNT)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "A role can only be listed once",
  });

interface VisibilityRules {
  visibility: EventVisibility;
  audienceRoleIds: string[];
}

/** The audience only means something for an internal event. */
const audienceOnlyWhenInternal = ({
  visibility: value,
  audienceRoleIds: roleIds,
}: VisibilityRules): boolean => value === "internal" || roleIds.length === 0;
const AUDIENCE_ISSUE = {
  path: ["audienceRoleIds"],
  message: "Only internal events have an audience",
};

/** `POST /content/calendar/events`: the row; what the event says goes in through the editorial draft. */
export const createEventBody = z
  .strictObject({
    year: calendarYearNumber,
    visibility,
    audienceRoleIds,
  })
  .refine(audienceOnlyWhenInternal, AUDIENCE_ISSUE);
export type CreateEventBody = z.infer<typeof createEventBody>;

/** `PATCH .../events/:id/settings`: direct (not editorial), with `version` (409 `stale_version`). */
export const eventSettingsBody = z
  .strictObject({
    visibility,
    audienceRoleIds,
    version: versionField,
  })
  .refine(audienceOnlyWhenInternal, AUDIENCE_ISSUE);
export type EventSettingsBody = z.infer<typeof eventSettingsBody>;

export const eventListQuery = z.object({
  year: z.coerce.number().int().pipe(calendarYearNumber),
});

/**
 * One row of the CRM list. The "when" and the titles come from the current revision (the working
 * one when there is one, the live one otherwise); an event whose draft was never saved has none.
 */
export const eventListItemDto = z.strictObject({
  id: z.uuid(),
  year: z.number().int(),
  visibility,
  audienceRoleIds: z.array(z.uuid()),
  /** Left by copying from a previous year: someone has to look at it again. */
  needsReview: z.boolean(),
  sequence: z.number().int(),
  version: z.number().int(),
  /** State of the current revision; `null` while no draft was ever saved. */
  editorialState: editorialStateDto.nullable(),
  /** The public site is showing a revision of this event. */
  isLive: z.boolean(),
  titles: z.record(z.string(), z.string()),
  startDate: calendarDate.nullable(),
  startTime: timeOfDay.nullable(),
  endDate: calendarDate.nullable(),
  allDay: z.boolean(),
  status: z.enum(EVENT_STATUSES).nullable(),
  ministryIds: z.array(z.uuid()),
});
export type EventListItemDto = z.infer<typeof eventListItemDto>;

export const eventListDto = z.strictObject({
  items: z.array(eventListItemDto),
});
export type EventListDto = z.infer<typeof eventListDto>;

/** The row alone, after creating it or changing its settings. */
export const eventDto = z.strictObject({
  id: z.uuid(),
  year: z.number().int(),
  visibility,
  audienceRoleIds: z.array(z.uuid()),
  needsReview: z.boolean(),
  sequence: z.number().int(),
  version: z.number().int(),
});
export type EventDto = z.infer<typeof eventDto>;
