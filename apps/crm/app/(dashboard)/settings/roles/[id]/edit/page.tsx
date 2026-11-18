import { notFound } from "next/navigation";
import { RoleForm } from "../../../components/role-form";
import { settingsRoles } from "../../../data/roles";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = settingsRoles.find((candidate) => candidate.id === id);

  if (!role) {
    notFound();
  }

  return (
    <RoleForm
      initialValues={{
        name: role.name,
        description: role.description,
        scope: role.scope,
        permissions: role.permissions,
      }}
      mode="edit"
    />
  );
}
