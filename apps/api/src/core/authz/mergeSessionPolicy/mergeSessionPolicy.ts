import type { SessionPolicy } from "../../context";

/** The role settings that decide how long and how a session lives. */
export interface RoleSessionSettings {
  persistentSession: boolean;
  maxSessionSeconds: number | null;
}

/**
 * The most restrictive role wins (D-16): the session is persistent only if every role allows it,
 * and lasts as long as the shortest maximum. No roles means the default policy.
 */
export function mergeSessionPolicy(
  roles: readonly RoleSessionSettings[],
): SessionPolicy {
  const limits = roles
    .map((role) => role.maxSessionSeconds)
    .filter((limit): limit is number => limit !== null);
  return {
    persistent: roles.every((role) => role.persistentSession),
    maxSessionSeconds: limits.length > 0 ? Math.min(...limits) : null,
  };
}
