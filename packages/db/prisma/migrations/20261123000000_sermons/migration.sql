-- CreateEnum
CREATE TYPE "PlatformLinkEntity" AS ENUM ('SERMON', 'PODCAST_EPISODE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'SPOTIFY', 'APPLE_PODCASTS');

-- AlterEnum
ALTER TYPE "MediaPurpose" ADD VALUE 'contentDocument';

-- AlterEnum
ALTER TYPE "EditorialContentType" ADD VALUE 'SERMON';

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "youtubeChannelId" TEXT;

-- CreateTable
CREATE TABLE "sermons" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "firstLiveAt" TIMESTAMPTZ(3),

    CONSTRAINT "sermons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sermon_series" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "coverMediaId" UUID,
    "plannedCount" INTEGER,
    "youtubePlaylistId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "sermon_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sermon_series_translations" (
    "id" UUID NOT NULL,
    "seriesId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "sermon_series_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_links" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "entityType" "PlatformLinkEntity" NOT NULL,
    "entityId" UUID NOT NULL,
    "platform" "Platform" NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationSeconds" INTEGER,
    "platformPublishedAt" TIMESTAMPTZ(3),
    "viewCount" INTEGER,
    "fetchedAt" TIMESTAMPTZ(3),

    CONSTRAINT "platform_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sermons_organizationId_idx" ON "sermons"("organizationId");

-- CreateIndex
CREATE INDEX "sermon_series_organizationId_idx" ON "sermon_series"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "sermon_series_translations_seriesId_locale_key" ON "sermon_series_translations"("seriesId", "locale");

-- CreateIndex
CREATE INDEX "platform_links_organizationId_entityType_entityId_idx" ON "platform_links"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_links_organizationId_platform_externalId_key" ON "platform_links"("organizationId", "platform", "externalId");

-- AddForeignKey
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_series" ADD CONSTRAINT "sermon_series_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_series" ADD CONSTRAINT "sermon_series_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_series_translations" ADD CONSTRAINT "sermon_series_translations_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "sermon_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_links" ADD CONSTRAINT "platform_links_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A YouTube playlist backs at most one live series per organization (deleted series do not count).
CREATE UNIQUE INDEX "sermon_series_youtubePlaylistId_key" ON "sermon_series"("organizationId", "youtubePlaylistId")
  WHERE "youtubePlaylistId" IS NOT NULL AND "deletedAt" IS NULL;

-- Security baseline (D-21): RLS and the app_runtime policy for the new tables.
SELECT public.app_secure_tables();

-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the calendar migrations).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('content.sermons', 'view'),
  ('content.sermons', 'create'),
  ('content.sermons', 'edit'),
  ('content.sermons', 'delete'),
  ('content.sermons', 'publish'),
  ('content.podcasts', 'view'),
  ('content.podcasts', 'create'),
  ('content.podcasts', 'edit'),
  ('content.podcasts', 'delete'),
  ('content.podcasts', 'publish')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
