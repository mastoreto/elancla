import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { loadSiteLocales } from "@/app/(dashboard)/website/people/lib/loadSiteLocales";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { createServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { EventEditPageContent } from "./components/event-edit-page-content";
import { loadEventOptions } from "./lib/loadEventOptions";
import { loadEventRow } from "./lib/loadEventRow";
import { loadEventStatus } from "./lib/loadEventStatus";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
  /** `year` is the year the list was showing: it saves looking in every year. */
  searchParams: Promise<{ year?: string }>;
}

function parseYearHint(year: string | undefined): number | null {
  const parsed = Number(year);
  return year !== undefined && Number.isInteger(parsed) ? parsed : null;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditEventPage({ params, searchParams }: EditEventPageProps) {
  const [{ id }, { year }, access] = await Promise.all([params, searchParams, getAccess()]);
  if (!access) notFound();

  // Awaited one by one: a tuple of both client types trips TypeScript's instantiation depth limit.
  const api = await createServerApiClient();
  const calendarApi = await createServerCalendarApiClient();
  const canEditSettings = can(access, PERMISSIONS.events.edit);
  const canReadRoles = can(access, PERMISSIONS.roles.view);
  const site = await loadSiteLocales(api);
  const [status, loaded, options] = await Promise.all([
    loadEventStatus(api, id),
    loadEventRow(calendarApi, id, parseYearHint(year)),
    loadEventOptions({
      api,
      calendarApi,
      defaultLocale: site.defaultLocale,
      includeRoles: canEditSettings && canReadRoles,
    }),
  ]);
  return (
    <EventEditPageContent
      calendarYear={loaded.calendarYear}
      canDelete={can(access, PERMISSIONS.events.delete)}
      canEditSettings={canEditSettings}
      event={loaded.event}
      ministries={options.ministries}
      places={options.places}
      roles={options.roles}
      site={site}
      status={status}
    />
  );
}
