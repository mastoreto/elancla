import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { canWithAllScope } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { LandingPageContent } from "./components/landing-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function MinistriesLandingPage() {
  const access = await getAccess();
  // The mosaic belongs to a role with the all scope: the leader of a ministry never learns of it.
  if (!access || !canWithAllScope(access, PERMISSIONS.ministryProfile.edit)) notFound();

  const api = await createServerApiClient();
  const response = await api.content.ministries.$get();
  if (!response.ok) throw new Error(`Could not load the ministries (${response.status})`);

  const { items } = await response.json();
  return <LandingPageContent ministries={items} />;
}
