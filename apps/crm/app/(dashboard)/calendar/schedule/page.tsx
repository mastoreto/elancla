import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { SchedulePageContent } from "./components/schedule-page-content";
import { loadScheduleData } from "./lib/loadScheduleData";

interface SchedulePageProps {
  searchParams: Promise<{ set?: string }>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function CalendarSchedulePage({ searchParams }: SchedulePageProps) {
  const access = await getAccess();
  if (!access || !can(access, PERMISSIONS.events.view)) notFound();

  const { set } = await searchParams;
  const data = await loadScheduleData({
    requestedSetId: set,
    canEdit: can(access, PERMISSIONS.events.edit),
    // The year after the current one: fixed activities with annual review are confirmed for it.
    reviewYear: new Date().getFullYear() + 1,
  });

  return <SchedulePageContent {...data} />;
}
