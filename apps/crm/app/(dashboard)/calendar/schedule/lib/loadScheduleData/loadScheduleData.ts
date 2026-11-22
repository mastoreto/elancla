import { createServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import type { SchedulePageData } from "../../types";
import { pickSelectedSet } from "../../utils/pickSelectedSet";
import { pickTranslated } from "../../utils/translatedText";
import { loadCalendarReferences } from "../loadCalendarReferences";

const UNNAMED_PLACE = "Sin nombre";

interface LoadScheduleDataOptions {
  /** The `?set=` of the URL: a set id, or anything else for "the default one". */
  requestedSetId: string | undefined;
  canEdit: boolean;
  /** The year the fixed activities are confirmed for. */
  reviewYear: number;
}

function failed(what: string, status: number): Error {
  return new Error(`Could not load ${what} (${status})`);
}

/** Everything the schedule screen shows, read on the server. */
export async function loadScheduleData({
  requestedSetId,
  canEdit,
  reviewYear,
}: LoadScheduleDataOptions): Promise<SchedulePageData> {
  const calendar = await createServerCalendarApiClient();
  const [setsRes, exceptionsRes, placesRes, yearsRes, { site, ministries }] = await Promise.all([
    calendar.content.calendar["schedule-sets"].$get(),
    calendar.content.calendar.exceptions.$get(),
    calendar.content.calendar.places.$get(),
    calendar.content.calendar.years.$get(),
    loadCalendarReferences(),
  ]);
  if (!setsRes.ok) throw failed("the schedule sets", setsRes.status);
  if (!exceptionsRes.ok) throw failed("the exceptions", exceptionsRes.status);
  if (!placesRes.ok) throw failed("the places", placesRes.status);
  if (!yearsRes.ok) throw failed("the years", yearsRes.status);

  const { items: sets } = await setsRes.json();
  const selected = pickSelectedSet(sets, requestedSetId);
  const activities = selected
    ? await calendar.content.calendar.activities.$get({ query: { scheduleSetId: selected.id } })
    : null;
  if (activities && !activities.ok) throw failed("the activities", activities.status);

  const [{ items: exceptions }, { items: places }, { items: years }] = await Promise.all([
    exceptionsRes.json(),
    placesRes.json(),
    yearsRes.json(),
  ]);

  return {
    sets,
    selectedSetId: selected?.id ?? null,
    activities: activities ? (await activities.json()).items : [],
    exceptions,
    site,
    places: places.map((place) => ({
      id: place.id,
      name: pickTranslated(
        place.translations,
        (translation) => translation.name,
        site.defaultLocale,
        UNNAMED_PLACE,
      ),
    })),
    ministries,
    review: { year: reviewYear, yearExists: years.some(({ year }) => year === reviewYear) },
    canEdit,
  };
}
