import type { MePermissionsDto } from "@ancla/contracts";
import { headers } from "next/headers";
import { cache } from "react";
import { isDevAuthBypassEnabled } from "@/lib/dev-auth-bypass";
import { ACCESS_HEADER, parseAccess } from "../accessHeader";
import { DEV_BYPASS_ACCESS } from "../devBypassAccess";
import { loadAccessFromApi } from "../loadAccessFromApi";

/**
 * Permissions of the signed-in user for this request. The proxy already loaded them and passes
 * them in an internal header, so normally there is no second API call; if the header is missing or
 * malformed this asks the API. `null` when there is no valid session.
 */
export const getAccess = cache(async (): Promise<MePermissionsDto | null> => {
  if (isDevAuthBypassEnabled()) return DEV_BYPASS_ACCESS;
  const requestHeaders = await headers();
  const fromProxy = parseAccess(requestHeaders.get(ACCESS_HEADER));
  return fromProxy ?? (await loadAccessFromApi(requestHeaders.get("cookie")));
});
