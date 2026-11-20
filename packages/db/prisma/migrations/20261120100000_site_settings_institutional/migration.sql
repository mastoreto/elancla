-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "serviceTimesSummary",
ADD COLUMN     "sectionStatuses" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "serviceTimes" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "site_settings_translations" DROP COLUMN "aboutRichText",
ADD COLUMN     "seoDescription" TEXT;


-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the audit_log and editorial_workflow migrations).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('site', 'view'),
  ('site', 'edit')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
