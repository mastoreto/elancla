import { auth } from "@ancla/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutShell } from "@/components/dashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Barrera autoritativa: valida la sesión contra la BD. Sin sesión → login.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
