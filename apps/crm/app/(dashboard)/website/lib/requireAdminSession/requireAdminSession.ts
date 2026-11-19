import { getAuth } from "@ancla/api";
import { headers } from "next/headers";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth-bypass";
import { assertAdminSession } from "./assertAdminSession";

/**
 * Server Actions are public HTTP endpoints, so each one must authorize itself; the dashboard
 * layout check does not cover them.
 * ponytail: plain admin role check until RBAC (phase 0.4) and the API (phase 1.3) replace it.
 */
export async function requireAdminSession(): Promise<void> {
  if (isDevAuthBypassEnabled()) {
    return;
  }
  const session = await getAuth().api.getSession({ headers: await headers() });
  assertAdminSession(session);
}
