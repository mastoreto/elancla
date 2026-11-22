-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'INTERNAL');

-- AlterEnum
ALTER TYPE "EditorialContentType" ADD VALUE 'EVENT';

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "liveAt" TIMESTAMPTZ(3),
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_audience_roles" (
    "eventId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "event_audience_roles_pkey" PRIMARY KEY ("eventId","roleId")
);

-- CreateTable
CREATE TABLE "activity_year_reviews" (
    "id" UUID NOT NULL,
    "activityId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "confirmedById" UUID NOT NULL,
    "confirmedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_year_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_reminder_settings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "recipientRoleIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "recipientUserIds" UUID[] DEFAULT ARRAY[]::UUID[],
    "lastSentOn" DATE,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "calendar_reminder_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_organizationId_year_idx" ON "events"("organizationId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "activity_year_reviews_activityId_year_key" ON "activity_year_reviews"("activityId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_reminder_settings_organizationId_key" ON "calendar_reminder_settings"("organizationId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_audience_roles" ADD CONSTRAINT "event_audience_roles_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_audience_roles" ADD CONSTRAINT "event_audience_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_year_reviews" ADD CONSTRAINT "activity_year_reviews_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "recurring_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_year_reviews" ADD CONSTRAINT "activity_year_reviews_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_reminder_settings" ADD CONSTRAINT "calendar_reminder_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A sequence never goes backwards.
ALTER TABLE "events" ADD CONSTRAINT "events_sequence_check" CHECK ("sequence" >= 0);

-- Security baseline (D-21): RLS and the app_runtime policy for the new tables.
SELECT public.app_secure_tables();
