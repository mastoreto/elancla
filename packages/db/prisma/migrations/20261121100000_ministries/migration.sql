-- CreateEnum
CREATE TYPE "MinistryDestination" AS ENUM ('PAGE', 'EXTERNAL', 'NONE');

-- CreateEnum
CREATE TYPE "MinistryLandingTile" AS ENUM ('COLOR', 'PHOTO');

-- AlterTable
ALTER TABLE "ministries" ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'secondary-700',
ADD COLUMN     "destination" "MinistryDestination" NOT NULL DEFAULT 'PAGE',
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "landingOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "landingPhotoId" UUID,
ADD COLUMN     "landingTile" "MinistryLandingTile" NOT NULL DEFAULT 'COLOR',
ADD COLUMN     "landingTone" TEXT NOT NULL DEFAULT 'mist',
ADD COLUMN     "showOnLanding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "person_roles" ADD COLUMN     "ministryId" UUID;

-- CreateTable
CREATE TABLE "ministry_categories" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ministry_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_category_translations" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ministry_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ministry_categories_organizationId_idx" ON "ministry_categories"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_category_translations_categoryId_locale_key" ON "ministry_category_translations"("categoryId", "locale");

-- DropIndex
DROP INDEX "person_roles_personProfileId_context_key";

-- CreateIndex
CREATE UNIQUE INDEX "person_roles_personProfileId_context_ministryId_key" ON "person_roles"("personProfileId", "context", "ministryId");

-- AddForeignKey
ALTER TABLE "ministries" ADD CONSTRAINT "ministries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ministry_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministries" ADD CONSTRAINT "ministries_landingPhotoId_fkey" FOREIGN KEY ("landingPhotoId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_categories" ADD CONSTRAINT "ministry_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_category_translations" ADD CONSTRAINT "ministry_category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ministry_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Only ministry leaders belong to a ministry, and every ministry leader does.
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_ministry_leader_check"
  CHECK (("context" = 'MINISTRY_LEADER') = ("ministryId" IS NOT NULL));

-- NULLs are distinct in a unique index: keep one role per person and context outside ministries.
CREATE UNIQUE INDEX "person_roles_personProfileId_context_no_ministry_key"
  ON "person_roles"("personProfileId", "context") WHERE "ministryId" IS NULL;

-- Security baseline (D-21): RLS and the app_runtime policy for the new tables.
SELECT public.app_secure_tables();
