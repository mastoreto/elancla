import { getAuth } from "@ancla/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutShell } from "@/components/dashboard";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth-bypass";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Barrera autoritativa: valida la sesión contra la BD. Sin sesión → login.
  if (isDevAuthBypassEnabled()) {
    return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
  }

  const session = await getAuth().api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
