-- AlterEnum
ALTER TYPE "EditorialContentType" ADD VALUE 'SIMPLE_PAGE';

-- CreateTable
CREATE TABLE "simple_pages" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simple_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simple_pages_organizationId_idx" ON "simple_pages"("organizationId");

-- AddForeignKey
ALTER TABLE "simple_pages" ADD CONSTRAINT "simple_pages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Security baseline (D-21): RLS and the app_runtime policy for the new table.
SELECT public.app_secure_tables();

-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the visit_page migration).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('content.pages', 'view'),
  ('content.pages', 'create'),
  ('content.pages', 'edit'),
  ('content.pages', 'delete'),
  ('content.pages', 'publish')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
