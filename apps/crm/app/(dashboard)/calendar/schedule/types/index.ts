import type {
  MinistryColor,
  RecurringActivityDto,
  ScheduleExceptionDto,
  ScheduleSetDto,
  ServiceKind,
} from "@ancla/contracts";

export interface SiteLocales {
  locales: readonly string[];
  defaultLocale: string;
}

/** Text of one field by locale, as the inputs hold it. */
export type LocaleTexts = Record<string, string>;

/** Error message by locale for a translated field. */
export type LocaleErrors = Record<string, string>;

/** A ministry the forms can pick: its dot takes the color of the token. */
export interface MinistryOption {
  id: string;
  name: string;
  color: MinistryColor;
}

export interface PlaceOption {
  id: string;
  name: string;
}

export interface ScheduleSetOption {
  id: string;
  name: string;
}

export interface ScheduleSetFormValues {
  names: LocaleTexts;
  /** "YYYY-MM-DD" or blank. */
  validFrom: string;
  validTo: string;
  isDefault: boolean;
  forcedActive: boolean;
  /** Kept as typed; validated as an integer when saving. */
  order: string;
}

export interface ScheduleSetFormErrors {
  names: LocaleErrors;
  validFrom?: string;
  validTo?: string;
  order?: string;
}

/** A select cannot hold an empty value, so "no kind" travels as this one. */
export type ServiceKindChoice = ServiceKind | "none";
export type ActivityScope = "fixed" | "year";

export interface ActivityFormValues {
  /** "0" (Sunday) to "6". */
  weekday: string;
  start: string;
  end: string;
  titles: LocaleTexts;
  /** Blank means no place. */
  placeId: string;
  serviceKind: ServiceKindChoice;
  isPublic: boolean;
  scope: ActivityScope;
  year: string;
  annualReview: boolean;
  ministryIds: string[];
}

export interface ActivityFormErrors {
  start?: string;
  end?: string;
  year?: string;
  ministryIds?: string;
  titles: LocaleErrors;
}

export interface ExceptionFormValues {
  date: string;
  /** Blank means "no meeting". */
  replacementSetId: string;
  messages: LocaleTexts;
}

export interface ExceptionFormErrors {
  date?: string;
  messages: LocaleErrors;
}

/** The yearly confirmation of the fixed activities: the year after the current one. */
export interface ReviewYear {
  year: number;
  /** The year exists in the calendar, so it can be confirmed. */
  yearExists: boolean;
}

export interface ActivitiesSectionData {
  scheduleSet: ScheduleSetOption;
  activities: readonly RecurringActivityDto[];
  site: SiteLocales;
  places: readonly PlaceOption[];
  ministries: readonly MinistryOption[];
  review: ReviewYear;
  canEdit: boolean;
}

export interface SchedulePageData {
  sets: readonly ScheduleSetDto[];
  /** The set whose activities are listed; `null` when there are no sets. */
  selectedSetId: string | null;
  activities: readonly RecurringActivityDto[];
  exceptions: readonly ScheduleExceptionDto[];
  site: SiteLocales;
  places: readonly PlaceOption[];
  ministries: readonly MinistryOption[];
  review: ReviewYear;
  canEdit: boolean;
}
