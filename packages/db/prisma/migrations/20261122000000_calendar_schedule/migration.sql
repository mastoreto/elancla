-- CreateEnum
CREATE TYPE "ServiceKind" AS ENUM ('WORSHIP', 'BIBLE_SCHOOL');

-- CreateEnum
CREATE TYPE "CalendarYearStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "serviceTimes";

-- CreateTable
CREATE TABLE "schedule_sets" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "validFrom" DATE,
    "validTo" DATE,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "forcedActive" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "schedule_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_set_translations" (
    "id" UUID NOT NULL,
    "scheduleSetId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "schedule_set_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_activities" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "scheduleSetId" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT,
    "placeId" UUID,
    "serviceKind" "ServiceKind",
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFixed" BOOLEAN NOT NULL DEFAULT true,
    "year" INTEGER,
    "annualReview" BOOLEAN NOT NULL DEFAULT false,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "recurring_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_activity_translations" (
    "id" UUID NOT NULL,
    "activityId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "recurring_activity_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_activity_ministries" (
    "activityId" UUID NOT NULL,
    "ministryId" UUID NOT NULL,

    CONSTRAINT "recurring_activity_ministries_pkey" PRIMARY KEY ("activityId","ministryId")
);

-- CreateTable
CREATE TABLE "schedule_exceptions" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "replacementSetId" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "schedule_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_exception_translations" (
    "id" UUID NOT NULL,
    "exceptionId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "schedule_exception_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "address" TEXT,
    "mapsUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_translations" (
    "id" UUID NOT NULL,
    "placeId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "place_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_years" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "CalendarYearStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMPTZ(3),
    "publishedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_sets_organizationId_idx" ON "schedule_sets"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_set_translations_scheduleSetId_locale_key" ON "schedule_set_translations"("scheduleSetId", "locale");

-- CreateIndex
CREATE INDEX "recurring_activities_organizationId_scheduleSetId_idx" ON "recurring_activities"("organizationId", "scheduleSetId");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_activity_translations_activityId_locale_key" ON "recurring_activity_translations"("activityId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_exceptions_organizationId_date_key" ON "schedule_exceptions"("organizationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_exception_translations_exceptionId_locale_key" ON "schedule_exception_translations"("exceptionId", "locale");

-- CreateIndex
CREATE INDEX "places_organizationId_idx" ON "places"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "place_translations_placeId_locale_key" ON "place_translations"("placeId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_years_organizationId_year_key" ON "calendar_years"("organizationId", "year");

-- AddForeignKey
ALTER TABLE "schedule_sets" ADD CONSTRAINT "schedule_sets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_set_translations" ADD CONSTRAINT "schedule_set_translations_scheduleSetId_fkey" FOREIGN KEY ("scheduleSetId") REFERENCES "schedule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_scheduleSetId_fkey" FOREIGN KEY ("scheduleSetId") REFERENCES "schedule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activity_translations" ADD CONSTRAINT "recurring_activity_translations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "recurring_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activity_ministries" ADD CONSTRAINT "recurring_activity_ministries_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "recurring_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_activity_ministries" ADD CONSTRAINT "recurring_activity_ministries_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_replacementSetId_fkey" FOREIGN KEY ("replacementSetId") REFERENCES "schedule_sets"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exception_translations" ADD CONSTRAINT "schedule_exception_translations_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "schedule_exceptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_translations" ADD CONSTRAINT "place_translations_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_years" ADD CONSTRAINT "calendar_years_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_years" ADD CONSTRAINT "calendar_years_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A fixed activity has no year, and one that is reviewed every year has to be fixed.
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_fixed_year_check"
  CHECK ("isFixed" = ("year" IS NULL));
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_annual_review_check"
  CHECK (NOT "annualReview" OR "isFixed");
ALTER TABLE "recurring_activities" ADD CONSTRAINT "recurring_activities_weekday_check"
  CHECK ("weekday" BETWEEN 0 AND 6);

-- One default and one manually forced schedule set per organization (deleted ones do not count).
CREATE UNIQUE INDEX "schedule_sets_one_default" ON "schedule_sets"("organizationId")
  WHERE "isDefault" AND "deletedAt" IS NULL;
CREATE UNIQUE INDEX "schedule_sets_one_forced" ON "schedule_sets"("organizationId")
  WHERE "forcedActive" AND "deletedAt" IS NULL;

-- Security baseline (D-21): RLS and the app_runtime policy for the new tables.
SELECT public.app_secure_tables();

-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the visit_page migration).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('content.events', 'view'),
  ('content.events', 'create'),
  ('content.events', 'edit'),
  ('content.events', 'delete'),
  ('content.events', 'publish'),
  ('calendar.internal', 'view'),
  ('calendar.year', 'publish')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
