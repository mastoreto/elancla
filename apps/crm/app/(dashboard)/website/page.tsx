import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { WebsiteSettingsPageContent } from "./components/website-settings-page-content";

const HTTP_FORBIDDEN = 403;

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function WebsitePage() {
  const api = await createServerApiClient();
  const response = await api.site.settings.$get();

  // Like the proxy, a role without `site:view` does not learn the section exists.
  if (response.status === HTTP_FORBIDDEN) notFound();
  if (!response.ok) throw new Error(`Could not load the site settings (${response.status})`);

  return <WebsiteSettingsPageContent settings={await response.json()} />;
}
