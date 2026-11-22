import { loadCalendarReferences } from "@/app/(dashboard)/calendar/schedule/lib/loadCalendarReferences";
import { createServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import type { CopyItem, CopyPageData } from "../../types";
import { toActivityItems, toEventItems } from "../../utils/copyItems";
import { pickCopyYears } from "../../utils/copyYears";

interface RequestedYears {
  from: number | undefined;
  to: number | undefined;
}

function failed(what: string, status: number): Error {
  return new Error(`Could not load ${what} (${status})`);
}

/** The years, and the copiable activities and events of the source year, read on the server. */
export async function loadCopyData(requested: RequestedYears): Promise<CopyPageData> {
  const calendar = await createServerCalendarApiClient();
  const [yearsRes, { site, ministries }] = await Promise.all([
    calendar.content.calendar.years.$get(),
    loadCalendarReferences(),
  ]);
  if (!yearsRes.ok) throw failed("the years", yearsRes.status);
  const { items: years } = await yearsRes.json();
  const { fromYear, toYear } = pickCopyYears(years, requested);
  if (fromYear === null) return { years, fromYear, toYear, items: [], ministries };

  const [activitiesRes, eventsRes] = await Promise.all([
    calendar.content.calendar.activities.$get({ query: {} }),
    calendar.content.calendar.events.$get({ query: { year: String(fromYear) } }),
  ]);
  if (!activitiesRes.ok) throw failed("the activities", activitiesRes.status);
  if (!eventsRes.ok) throw failed("the events", eventsRes.status);
  const items: CopyItem[] = [
    ...toActivityItems((await activitiesRes.json()).items, fromYear, site.defaultLocale),
    ...toEventItems((await eventsRes.json()).items, site.defaultLocale),
  ];
  return { years, fromYear, toYear, items, ministries };
}
