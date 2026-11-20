import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { PersonForm } from "../components/person-form";
import { loadLinkableUsers } from "../lib/loadLinkableUsers";
import { loadSiteLocales } from "../lib/loadSiteLocales";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function NewPersonPage() {
  const access = await getAccess();
  if (!(access && can(access, PERMISSIONS.people.create))) notFound();

  const api = await createServerApiClient();
  const [site, users] = await Promise.all([loadSiteLocales(api), loadLinkableUsers(api, access)]);
  return <PersonForm person={null} site={site} users={users} />;
}
