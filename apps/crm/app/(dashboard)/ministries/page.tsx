import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
// ponytail: shared with the people, pages and blog screens; it moves to `lib` if a fifth needs it.
import { loadSiteLocales } from "../website/people/lib/loadSiteLocales";
import { MinistriesListPageContent } from "./components/ministries-list-page-content";
import { loadMinistryCategories } from "./lib/loadMinistryCategories";

const HTTP_FORBIDDEN = 403;

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function MinistriesPage() {
  const api = await createServerApiClient();
  const [response, categories, site] = await Promise.all([
    api.content.ministries.$get(),
    loadMinistryCategories(api),
    loadSiteLocales(api),
  ]);

  // Like the proxy, a role without `ministryProfile:view` does not learn the section exists.
  if (response.status === HTTP_FORBIDDEN) notFound();
  if (!response.ok) throw new Error(`Could not load the ministries (${response.status})`);

  const { items } = await response.json();
  return (
    <MinistriesListPageContent
      categories={categories}
      defaultLocale={site.defaultLocale}
      ministries={items}
    />
  );
}
