// ponytail: shared with the people, pages, blog and ministries screens; it moves to `lib` if a sixth needs it.
import { loadSiteLocales } from "@/app/(dashboard)/website/people/lib/loadSiteLocales";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import type { MinistryOption, SiteLocales } from "../../types";

export interface CalendarReferences {
  site: SiteLocales;
  ministries: MinistryOption[];
}

/**
 * The languages and the ministries the calendar screens need besides their own data. They live in
 * the main API (not in the calendar router), so they are read with its own client.
 */
export async function loadCalendarReferences(): Promise<CalendarReferences> {
  const api = await createServerApiClient();
  const [ministriesResponse, site] = await Promise.all([
    api.content.ministries.$get(),
    loadSiteLocales(api),
  ]);
  // A role without ministry access still works the calendar; it just cannot pick or filter ministries.
  const ministries = ministriesResponse.ok ? (await ministriesResponse.json()).items : [];
  return {
    site,
    ministries: ministries.map(({ id, name, color }) => ({ id, name, color })),
  };
}
