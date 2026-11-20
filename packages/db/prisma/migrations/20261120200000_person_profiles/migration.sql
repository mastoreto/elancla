-- CreateEnum
CREATE TYPE "PersonContext" AS ENUM ('TEAM', 'BLOG_AUTHOR', 'PREACHER', 'MINISTRY_LEADER');

-- CreateTable
CREATE TABLE "person_profiles" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "photoId" UUID,
    "userId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "person_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_profile_translations" (
    "id" UUID NOT NULL,
    "personProfileId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "person_profile_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_roles" (
    "id" UUID NOT NULL,
    "personProfileId" UUID NOT NULL,
    "context" "PersonContext" NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "person_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_role_translations" (
    "id" UUID NOT NULL,
    "personRoleId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "person_role_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "person_profiles_organizationId_name_idx" ON "person_profiles"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "person_profiles_organizationId_userId_key" ON "person_profiles"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "person_profile_translations_personProfileId_locale_key" ON "person_profile_translations"("personProfileId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "person_roles_personProfileId_context_key" ON "person_roles"("personProfileId", "context");

-- CreateIndex
CREATE UNIQUE INDEX "person_role_translations_personRoleId_locale_key" ON "person_role_translations"("personRoleId", "locale");

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profile_translations" ADD CONSTRAINT "person_profile_translations_personProfileId_fkey" FOREIGN KEY ("personProfileId") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_personProfileId_fkey" FOREIGN KEY ("personProfileId") REFERENCES "person_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_role_translations" ADD CONSTRAINT "person_role_translations_personRoleId_fkey" FOREIGN KEY ("personRoleId") REFERENCES "person_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Security baseline (D-21): RLS and the app_runtime policy for the new tables.
SELECT public.app_secure_tables();

-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the site_settings_institutional migration).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('content.people', 'view'),
  ('content.people', 'create'),
  ('content.people', 'edit'),
  ('content.people', 'delete')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
