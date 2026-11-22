import {
  findOrganizationTimezone,
  findPublicEventRows,
  findYearExceptions,
  isYearPublished,
  listPlaceRows,
  type PlaceRow,
  type PublicEventRow,
  type PublicExceptionRow,
} from "../../data";
import { localDateIn, yearOf } from "../../domain";
import {
  type PublicWeekSlot,
  resolvePublicWeekActivities,
} from "../resolvePublicWeekActivities";

/** Everything the public calendar reads before the language is applied. */
export interface PublicCalendarData {
  timezone: string;
  year: number;
  published: boolean;
  /** Public activities of the week the calendar shows (the year's first week for another year). */
  weekly: PublicWeekSlot[];
  exceptions: PublicExceptionRow[];
  /** Public events of the year; empty unless the year is published. Content is in the snapshots. */
  events: PublicEventRow[];
  places: PlaceRow[];
}

const FIRST_DAY = "01-01";

/**
 * The raw rows of the public calendar of a year (the current one, in the church time zone, unless
 * another is asked). Fixed public activities are always there; the activities of the year and its
 * events only when that year is published. The week shown is the one that starts today for the
 * current year, and the first week of the year for any other, resolved by the same rules as the
 * service times.
 */
export async function loadPublicCalendar(input: {
  organizationId: string;
  year?: number | undefined;
  now?: Date;
}): Promise<PublicCalendarData | null> {
  const { organizationId, now = new Date() } = input;
  const organization = await findOrganizationTimezone(organizationId);
  if (!organization) return null;
  const today = localDateIn(organization.timezone, now);
  const year = input.year ?? yearOf(today);
  const published = await isYearPublished(organizationId, year);
  const [weekly, exceptions, events, places] = await Promise.all([
    resolvePublicWeekActivities(organizationId, now, {
      from: year === yearOf(today) ? today : `${year}-${FIRST_DAY}`,
    }),
    findYearExceptions(organizationId, year),
    published ? findPublicEventRows(organizationId, year) : Promise.resolve([]),
    listPlaceRows(organizationId),
  ]);
  return {
    timezone: organization.timezone,
    year,
    published,
    weekly,
    exceptions,
    events,
    places,
  };
}
