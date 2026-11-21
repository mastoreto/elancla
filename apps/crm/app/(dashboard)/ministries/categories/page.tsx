import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { canWithAllScope } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
// ponytail: shared with the people, pages and blog screens; it moves to `lib` if a fifth needs it.
import { loadSiteLocales } from "../../website/people/lib/loadSiteLocales";
import { CategoriesPageContent } from "./components/categories-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function MinistryCategoriesPage() {
  const access = await getAccess();
  // Categories belong to a role with the all scope: the leader of a ministry never learns of them.
  if (!access || !canWithAllScope(access, PERMISSIONS.ministryProfile.edit)) notFound();

  const api = await createServerApiClient();
  const [response, site] = await Promise.all([
    api.content["ministry-categories"].$get(),
    loadSiteLocales(api),
  ]);
  if (!response.ok) throw new Error(`Could not load the categories (${response.status})`);

  return <CategoriesPageContent categories={(await response.json()).items} site={site} />;
}
