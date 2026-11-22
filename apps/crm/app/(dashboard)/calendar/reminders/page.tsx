import { notFound } from "next/navigation";
import { getAccess } from "@/lib/authz/getAccess";
import { RemindersPageContent } from "./components/reminders-page-content";
import { loadReminderSources } from "./lib/loadReminderSources";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function CalendarRemindersPage() {
  const access = await getAccess();
  if (!access) notFound();

  const sources = await loadReminderSources(access);
  if (!sources) notFound();
  return <RemindersPageContent sources={sources} />;
}
