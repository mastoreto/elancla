import type { MinistryColor } from "@ancla/contracts";

/** What an event row needs of a ministry: its label and the token that colors the event. */
export interface CalendarMinistry {
  id: string;
  name: string;
  color: MinistryColor;
}

/** A role the audience of an internal event can be picked from. */
export interface CalendarRoleOption {
  id: string;
  name: string;
}
