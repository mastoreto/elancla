-- AlterTable
ALTER TABLE "site_settings_translations" ADD COLUMN     "directionsAccessibility" TEXT,
ADD COLUMN     "directionsParking" TEXT,
ADD COLUMN     "directionsTransit" TEXT;

-- CreateTable
CREATE TABLE "visit_faqs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "visit_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_faq_translations" (
    "id" UUID NOT NULL,
    "visitFaqId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "visit_faq_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visit_faqs_organizationId_order_idx" ON "visit_faqs"("organizationId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "visit_faq_translations_visitFaqId_locale_key" ON "visit_faq_translations"("visitFaqId", "locale");

-- AddForeignKey
ALTER TABLE "visit_faqs" ADD CONSTRAINT "visit_faqs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_faq_translations" ADD CONSTRAINT "visit_faq_translations_visitFaqId_fkey" FOREIGN KEY ("visitFaqId") REFERENCES "visit_faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Security baseline (D-21): RLS and the app_runtime policy for the new tables.
SELECT public.app_secure_tables();

-- Data: the seed never updates roles that already exist, so the content editor gets its new
-- permissions here (same pattern as the person_profiles migration).
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "roles"."id", "grants"."resource", "grants"."action", 'all'
FROM "roles"
CROSS JOIN (VALUES
  ('content.visit', 'view'),
  ('content.visit', 'edit')
) AS "grants"("resource", "action")
WHERE "roles"."key" = 'content-editor'
ON CONFLICT DO NOTHING;
