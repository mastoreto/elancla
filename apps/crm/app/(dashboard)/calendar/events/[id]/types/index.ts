import type {
  CalendarYearDto,
  EventListItemDto,
  EventPlaceMode,
  EventStatus,
  EventVisibility,
} from "@ancla/contracts";

export type { SiteLocales } from "@/app/(dashboard)/ministries/types";

/** What one language of an event looks like while it is being edited. */
export interface EventTranslationValues {
  title: string;
  description: string;
}

/** The event while it is being edited; empty strings mean "not set". */
export interface EventFormValues {
  /** Editing state by locale. */
  translations: Record<string, EventTranslationValues>;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  placeMode: EventPlaceMode;
  placeId: string;
  externalAddress: string;
  ministryIds: string[];
  /** Id of the picture; empty when there is none. */
  imageId: string;
  linkUrl: string;
  status: EventStatus;
}

export type EventTranslationField = "title" | "description";

export type EventGeneralField =
  | "startDate"
  | "startTime"
  | "endDate"
  | "endTime"
  | "placeId"
  | "externalAddress"
  | "ministryIds"
  | "imageId"
  | "linkUrl";

export interface EventFormErrors {
  translations: Record<string, Partial<Record<EventTranslationField, string>>>;
  general: Partial<Record<EventGeneralField, string>>;
}

/** The visibility card while it is being edited. */
export interface EventSettingsValues {
  visibility: EventVisibility;
  audienceRoleIds: string[];
}

/** The part of the event row the editor needs (a row of the year list). */
export type EventRow = Pick<
  EventListItemDto,
  "id" | "year" | "visibility" | "audienceRoleIds" | "needsReview" | "version" | "isLive"
>;

/** A choice of a select or chip group. */
export interface EventOption {
  id: string;
  label: string;
}

/** Everything the editor reads next to the editorial status. */
export interface EventEditorData {
  event: EventRow;
  calendarYear: CalendarYearDto;
  ministries: readonly EventOption[];
  places: readonly EventOption[];
  /** Empty unless the user can both edit the settings and read the roles. */
  roles: readonly EventOption[];
}
