-- CreateEnum
CREATE TYPE "EditorialContentType" AS ENUM ('BLOG_POST', 'MINISTRY');

-- CreateEnum
CREATE TYPE "EditorialState" AS ENUM ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED', 'PAUSED', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "contentType" "EditorialContentType" NOT NULL,
    "entityId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "state" "EditorialState" NOT NULL,
    "snapshot" JSONB NOT NULL,
    "authorId" UUID NOT NULL,
    "reviewerId" UUID,
    "comment" TEXT,
    "submittedAt" TIMESTAMPTZ(3),
    "decidedAt" TIMESTAMPTZ(3),
    "publishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_settings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "contentType" "EditorialContentType" NOT NULL,
    "reviewerRoleIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "reviewerUserIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "mandatoryReviewRoleIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "mandatoryReviewUserIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "editorial_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_revisions_organizationId_state_idx" ON "content_revisions"("organizationId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_organizationId_contentType_entityId_numbe_key" ON "content_revisions"("organizationId", "contentType", "entityId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "editorial_settings_organizationId_contentType_key" ON "editorial_settings"("organizationId", "contentType");

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_settings" ADD CONSTRAINT "editorial_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- At most one working revision and one live revision per entity. Enforced here, not in code, so
-- two concurrent saves can never both create a draft.
CREATE UNIQUE INDEX "content_revisions_one_working" ON "content_revisions" ("organizationId", "contentType", "entityId")
WHERE "state" IN ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED');

CREATE UNIQUE INDEX "content_revisions_one_live" ON "content_revisions" ("organizationId", "contentType", "entityId")
WHERE "state" IN ('PUBLISHED', 'PAUSED');

-- Common tables: generic app_runtime policy (RLS enabled).
SELECT public.app_secure_tables();

-- The history is never deleted (the FK to the author is RESTRICT for the same reason).
REVOKE DELETE ON TABLE "content_revisions" FROM app_runtime;

-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the audit_log migration).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('content.posts', 'view'),
  ('content.posts', 'create'),
  ('content.posts', 'edit'),
  ('content.posts', 'delete'),
  ('content.posts', 'publish'),
  ('ministries.profile', 'publish')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
