import { PERMISSIONS } from "@ancla/contracts";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import { type AccessSnapshot, can } from "@/lib/authz/can";
import type { LinkableUser } from "../../types";

const USERS_LIMIT = "100";

/** Users a profile can be linked to; empty when the role may not list users. */
export async function loadLinkableUsers(
  api: ServerApiClient,
  access: AccessSnapshot,
): Promise<LinkableUser[]> {
  if (!can(access, PERMISSIONS.users.view)) return [];
  const response = await api.users.$get({ query: { limit: USERS_LIMIT } });
  if (!response.ok) return [];
  const { items } = await response.json();
  return items.map(({ id, name, email }) => ({ id, name, email }));
}
