import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { createServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
// ponytail: shared with the people, pages, blog and ministries screens; it moves to `lib` if a sixth needs it.
import { loadSiteLocales } from "../../website/people/lib/loadSiteLocales";
import { PlacesPageContent } from "./components/places-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function CalendarPlacesPage() {
  const access = await getAccess();
  if (!access || !can(access, PERMISSIONS.events.view)) notFound();

  const calendar = await createServerCalendarApiClient();
  const api = await createServerApiClient();
  const [response, site] = await Promise.all([
    calendar.content.calendar.places.$get(),
    loadSiteLocales(api),
  ]);
  if (!response.ok) throw new Error(`Could not load the places (${response.status})`);

  return (
    <PlacesPageContent
      canEdit={can(access, PERMISSIONS.events.edit)}
      places={(await response.json()).items}
      site={site}
    />
  );
}
