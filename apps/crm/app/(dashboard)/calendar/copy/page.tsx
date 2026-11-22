import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { CopyPageContent } from "./components/copy-page-content";
import { loadCopyData } from "./lib/loadCopyData";

interface CopyPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

function yearParam(value: string | undefined): number | undefined {
  const year = Number(value);
  return Number.isInteger(year) ? year : undefined;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function CalendarCopyPage({ searchParams }: CopyPageProps) {
  const access = await getAccess();
  // Copying writes: it needs the edit permission, reading is not enough.
  if (!access || !can(access, PERMISSIONS.events.edit)) notFound();

  const { from, to } = await searchParams;
  const data = await loadCopyData({ from: yearParam(from), to: yearParam(to) });

  return <CopyPageContent key={`${data.fromYear}-${data.toYear}`} {...data} />;
}
