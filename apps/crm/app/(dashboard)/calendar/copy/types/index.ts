import type { CalendarYearDto } from "@ancla/contracts";
import type { MinistryOption } from "@/app/(dashboard)/calendar/schedule/types";

export type { MinistryOption };

export type CopyItemKind = "activity" | "event";

/** One thing of the source year that can be copied, in the shape the wizard lists it. */
export interface CopyItem {
  id: string;
  kind: CopyItemKind;
  title: string;
  /** When it happens, already formatted for reading. */
  detail: string;
  ministryIds: readonly string[];
}

export type KindFilter = "all" | CopyItemKind;

export interface CopyFilters {
  kind: KindFilter;
  /** A ministry id, or blank for every ministry. */
  ministryId: string;
}

export interface CopyPageData {
  years: readonly CalendarYearDto[];
  /** `null` while there is no year to copy from. */
  fromYear: number | null;
  /** `null` while there is no draft year to copy into. */
  toYear: number | null;
  items: readonly CopyItem[];
  ministries: readonly MinistryOption[];
}

/** What the server said it copied. */
export interface CopyOutcome {
  activities: number;
  events: number;
}
