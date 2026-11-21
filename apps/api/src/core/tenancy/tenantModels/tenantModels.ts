/**
 * Child tables (translations, `PostViewDaily`, `PostViewVisitor`) carry no `organizationId`: they
 * are always reached through their tenant parent, like the 1.3b child tables, so they are not listed.
 *
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
  "Post",
  "Category",
  "MinistryCategory",
  "Series",
]);
