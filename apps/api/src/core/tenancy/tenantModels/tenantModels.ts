/**
 * Prisma models that carry `organizationId`. A test compares this list with the real schema,
 * so adding a tenant table without listing it here fails the build.
 */
export const TENANT_MODELS: ReadonlySet<string> = new Set([
  "SiteSettings",
  "DocumentSequence",
  "Invitation",
  "Role",
  "Ministry",
  "AuditLog",
  "MediaFile",
  "SiteApiKey",
  "ContentRevision",
  "EditorialSettings",
  "PersonProfile",
  "VisitFaq",
  "SimplePage",
]);
