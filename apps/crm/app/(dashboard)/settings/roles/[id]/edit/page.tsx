import { notFound } from "next/navigation";
import { RoleForm } from "../../../components/role-form";
import { settingsRoles } from "../../../data/roles";
import { settingsUsers } from "../../../data/users";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = settingsRoles.find((candidate) => candidate.id === id);

  if (!role) {
    notFound();
  }

  const members = settingsUsers.filter((user) => user.role === role.profile);

  return <RoleForm members={members} role={role} />;
}
