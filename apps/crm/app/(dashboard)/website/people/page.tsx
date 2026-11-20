import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { PeopleListPageContent } from "./components/people-list-page-content";
import { loadSiteLocales } from "./lib/loadSiteLocales";

const HTTP_FORBIDDEN = 403;

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function PeoplePage() {
  const api = await createServerApiClient();
  const [response, { defaultLocale }] = await Promise.all([
    api.content.people.$get(),
    loadSiteLocales(api),
  ]);

  // Like the proxy, a role without `people:view` does not learn the section exists.
  if (response.status === HTTP_FORBIDDEN) notFound();
  if (!response.ok) throw new Error(`Could not load the people (${response.status})`);

  const { data } = await response.json();
  return <PeopleListPageContent defaultLocale={defaultLocale} people={data} />;
}
