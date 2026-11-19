import { RoleForm } from "../../components/role-form";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function NewRolePage() {
  // The proxy only lets admins with `roles:create` reach this route.
  return <RoleForm />;
}
