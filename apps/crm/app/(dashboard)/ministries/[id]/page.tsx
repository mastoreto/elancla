import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { canWithAllScope } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
// ponytail: shared with the people, pages and blog screens; it moves to `lib` if a fifth needs it.
import { loadSiteLocales } from "../../website/people/lib/loadSiteLocales";
import { MinistryEditPageContent } from "./components/ministry-edit-page-content";
import { loadMinistryEditor } from "./lib/loadMinistryEditor";
import { loadMinistryStatus } from "./lib/loadMinistryStatus";

interface EditMinistryPageProps {
  params: Promise<{ id: string }>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditMinistryPage({ params }: EditMinistryPageProps) {
  const [{ id }, access] = await Promise.all([params, getAccess()]);
  if (!access) notFound();

  const api = await createServerApiClient();
  const canConfigure = canWithAllScope(access, PERMISSIONS.ministryProfile.edit);
  const [status, site, configuration] = await Promise.all([
    loadMinistryStatus(api, id),
    loadSiteLocales(api),
    canConfigure ? loadMinistryEditor(api, id) : null,
  ]);
  return (
    <MinistryEditPageContent
      configuration={configuration}
      ministryId={id}
      site={site}
      status={status}
    />
  );
}
