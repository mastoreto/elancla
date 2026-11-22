import type { EventListItemDto, RecurringActivityDto } from "@ancla/contracts";
import { formatCalendarDate } from "@/app/(dashboard)/calendar/schedule/utils/describeValidity";
import { pickTranslated } from "@/app/(dashboard)/calendar/schedule/utils/translatedText";
import {
  describeTimeRange,
  WEEKDAY_LABELS,
} from "@/app/(dashboard)/calendar/schedule/utils/weekdays";
import type { CopyItem } from "../../types";

const UNTITLED = "Sin título";
const NO_DATE = "Sin fecha";

/**
 * The activities of the source year the wizard can copy: only the ones tied to that year. Fixed
 * activities repeat by themselves, so they are never listed.
 */
export function toActivityItems(
  activities: readonly RecurringActivityDto[],
  fromYear: number,
  defaultLocale: string,
): CopyItem[] {
  return activities
    .filter((activity) => !activity.isFixed && activity.year === fromYear)
    .map((activity) => ({
      id: activity.id,
      kind: "activity",
      title: pickTranslated(
        activity.translations,
        (translation) => translation.title,
        defaultLocale,
        UNTITLED,
      ),
      detail: `${WEEKDAY_LABELS[activity.weekday]} · ${describeTimeRange(activity.start, activity.end)}`,
      ministryIds: activity.ministryIds,
    }));
}

function describeEventDate(event: EventListItemDto): string {
  if (event.startDate === null) return NO_DATE;
  const date = formatCalendarDate(event.startDate);
  return event.startTime ? `${date} · ${event.startTime}` : date;
}

/** The events of the source year, with their date when they have one. */
export function toEventItems(
  events: readonly EventListItemDto[],
  defaultLocale: string,
): CopyItem[] {
  return events.map((event) => ({
    id: event.id,
    kind: "event",
    title: event.titles[defaultLocale] ?? Object.values(event.titles)[0] ?? UNTITLED,
    detail: describeEventDate(event),
    ministryIds: event.ministryIds,
  }));
}
