import { getAuth } from "@ancla/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutShell } from "@/components/dashboard";
import { AccessProvider } from "@/lib/authz/AccessProvider";
import { getAccess } from "@/lib/authz/getAccess";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth-bypass";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Barrera autoritativa: valida la sesión contra la BD. Sin sesión → login.
  const session = isDevAuthBypassEnabled()
    ? null
    : await getAuth().api.getSession({ headers: await headers() });
  if (!(session || isDevAuthBypassEnabled())) {
    redirect("/");
  }

  // Permisos de la persona (la API es la autoridad); arman el menú y las vistas.
  const access = await getAccess();
  if (!access) {
    redirect("/");
  }

  const user = session
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        roleNames: access.roles.map((role) => role.name),
      }
    : null;

  return (
    <AccessProvider access={access}>
      <DashboardLayoutShell user={user}>{children}</DashboardLayoutShell>
    </AccessProvider>
  );
}
