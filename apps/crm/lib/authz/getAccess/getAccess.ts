import type { MePermissionsDto } from "@ancla/contracts";
import { cache } from "react";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth-bypass";

/** Without a session (development bypass) the screens must still render: full access, no roles. */
const DEV_BYPASS_ACCESS: MePermissionsDto = {
  isAdmin: true,
  roles: [],
  grants: [],
  ministryIds: [],
};

/**
 * Permissions of the signed-in user, asked to the API once per request. `null` when there is no
 * valid session. The API is the authority; this only drives what the CRM shows.
 */
export const getAccess = cache(async (): Promise<MePermissionsDto | null> => {
  if (isDevAuthBypassEnabled()) return DEV_BYPASS_ACCESS;
  const api = await createServerApiClient();
  const response = await api.me.permissions.$get();
  return response.ok ? await response.json() : null;
});
