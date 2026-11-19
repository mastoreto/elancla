import type { PermissionScope } from "@ancla/contracts";

interface CanDownloadInput {
  /** Scope of the purpose's download permission for the caller. */
  scope: PermissionScope;
  uploadedById: string | null;
  userId: string;
}

/**
 * `all` sees every file; `own` and `ministry` only what the caller uploaded.
 * ponytail: until phase 2.3 links a file to its purchase order, there is no owner whose ministry
 * could widen `ministry`; then the owner's policy replaces this rule.
 */
export function canDownload({
  scope,
  uploadedById,
  userId,
}: CanDownloadInput): boolean {
  if (scope === "all") return true;
  return uploadedById === userId;
}
