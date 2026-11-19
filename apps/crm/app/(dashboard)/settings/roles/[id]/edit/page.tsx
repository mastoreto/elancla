import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { RoleForm } from "../../../components/role-form";

const MEMBERS_PAGE_LIMIT = "100";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The proxy already authorized this route; the access is only needed to decide what to load.
  const access = await getAccess();
  if (!access) {
    notFound();
  }
  const api = await createServerApiClient();

  const roleResponse = await api.roles[":id"].$get({ param: { id } });
  if (!roleResponse.ok) {
    notFound();
  }
  const role = await roleResponse.json();

  // Naming the members needs `users:view`; without it the form shows only the count.
  const usersResponse = can(access, PERMISSIONS.users.view)
    ? await api.users.$get({ query: { limit: MEMBERS_PAGE_LIMIT } })
    : null;
  const users = usersResponse?.ok ? (await usersResponse.json()).items : [];
  const members = users.filter((user) => user.roles.some((held) => held.id === role.id));

  return <RoleForm members={members} role={role} />;
}
