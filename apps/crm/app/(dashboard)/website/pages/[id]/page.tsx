import { createServerApiClient } from "@/lib/api/createServerApiClient";
// ponytail: shared with the people screens; it moves to `website/lib` if a third one needs it.
import { loadSiteLocales } from "../../people/lib/loadSiteLocales";
import { PageForm } from "../components/page-form";
import { loadPageStatus } from "../lib/loadPageStatus";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const api = await createServerApiClient();
  const [status, site] = await Promise.all([loadPageStatus(api, id), loadSiteLocales(api)]);
  return <PageForm pageId={id} site={site} status={status} />;
}
