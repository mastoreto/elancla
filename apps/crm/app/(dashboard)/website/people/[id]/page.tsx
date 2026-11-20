import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { getAccess } from "@/lib/authz/getAccess";
import { PersonForm } from "../components/person-form";
import { loadLinkableUsers } from "../lib/loadLinkableUsers";
import { loadSiteLocales } from "../lib/loadSiteLocales";

const NOT_VISIBLE_STATUSES = [400, 403, 404];

interface EditPersonPageProps {
  params: Promise<{ id: string }>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const [{ id }, access] = await Promise.all([params, getAccess()]);
  if (!access) notFound();

  const api = await createServerApiClient();
  const [response, site, users] = await Promise.all([
    api.content.people[":id"].$get({ param: { id } }),
    loadSiteLocales(api),
    loadLinkableUsers(api, access),
  ]);

  if (NOT_VISIBLE_STATUSES.includes(response.status)) notFound();
  if (!response.ok) throw new Error(`Could not load the person (${response.status})`);

  return <PersonForm person={await response.json()} site={site} users={users} />;
}
