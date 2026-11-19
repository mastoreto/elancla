import { app } from "@ancla/api";
import type { MePermissionsDto } from "@ancla/contracts";
import { createInProcessApiClient } from "@/lib/api/createInProcessApiClient";

/**
 * Permissions of the session in `cookie`, asked in process to `GET /me/permissions` (no network).
 * `null` when the session is missing or invalid. Server only: it pulls in the API and Prisma.
 */
export async function loadAccessFromApi(cookie: string | null): Promise<MePermissionsDto | null> {
  const api = createInProcessApiClient({ dispatch: (request) => app.request(request), cookie });
  const response = await api.me.permissions.$get();
  return response.ok ? await response.json() : null;
}
