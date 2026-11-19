import { requirePermissions } from "@/lib/authz/requireRoutePermission";
import { RoleForm } from "../../components/role-form";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function NewRolePage() {
  await requirePermissions(["roles:create"]);
  return <RoleForm />;
}
