import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { CalendarPageContent } from "./components/calendar-page-content";
import { loadCalendarOverview } from "./lib/loadCalendarOverview";

interface CalendarPageProps {
  searchParams: Promise<{ year?: string }>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const [{ year }, access] = await Promise.all([searchParams, getAccess()]);
  if (!access) notFound();

  // Like the proxy, a role without `events:view` does not learn the section exists.
  const overview = await loadCalendarOverview({ requestedYear: year, access });
  if (!overview) notFound();

  return (
    <CalendarPageContent
      overview={overview}
      permissions={{
        canEdit: can(access, PERMISSIONS.events.edit),
        canCreate: can(access, PERMISSIONS.events.create),
        canPublish: can(access, PERMISSIONS.calendarYear.publish),
        canUseInternal: can(access, PERMISSIONS.calendarInternal.view),
      }}
    />
  );
}
