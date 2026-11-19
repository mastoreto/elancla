import { type PermissionGrant, permissionGrantSchema } from "@ancla/contracts";

/**
 * Stored permission rows as typed grants. A row the catalog no longer supports (a resource that
 * was renamed or removed) is dropped, so stale data can only ever grant less.
 */
export function toPermissionGrants(
  rows: readonly { resource: string; action: string; scope: string }[],
): PermissionGrant[] {
  return rows.flatMap((row) => {
    const parsed = permissionGrantSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}
