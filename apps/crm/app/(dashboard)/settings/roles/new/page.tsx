import { notFound } from "next/navigation";
import { requirePermissions } from "@/lib/authz/requireRoutePermission";
import { RoleForm } from "../../components/role-form";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function NewRolePage() {
  const access = await requirePermissions(["roles:create"]);
  // Only an admin creates roles (the API enforces it as well).
  if (!access.isAdmin) notFound();
  return <RoleForm />;
}
