import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { VisitPageContent } from "./components/visit-page-content";

const HTTP_FORBIDDEN = 403;

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function VisitPage() {
  const api = await createServerApiClient();
  const response = await api.site.visit.$get();

  // Like the proxy, a role without `visit:view` does not learn the section exists.
  if (response.status === HTTP_FORBIDDEN) notFound();
  if (!response.ok) throw new Error(`Could not load the visit content (${response.status})`);

  return <VisitPageContent content={await response.json()} />;
}
