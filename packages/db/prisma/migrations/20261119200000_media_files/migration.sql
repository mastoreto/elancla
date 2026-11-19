-- CreateEnum
CREATE TYPE "MediaPurpose" AS ENUM ('contentImage', 'voucherDocument');

-- CreateEnum
CREATE TYPE "MediaFileStatus" AS ENUM ('pending', 'ready');

-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "purpose" "MediaPurpose" NOT NULL,
    "status" "MediaFileStatus" NOT NULL DEFAULT 'pending',
    "key" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "originalName" TEXT NOT NULL,
    "variants" JSONB,
    "uploadedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMPTZ(3),

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_key_key" ON "media_files"("key");

-- CreateIndex
CREATE INDEX "media_files_organizationId_status_createdAt_idx" ON "media_files"("organizationId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Common table: it gets the generic app_runtime policy (not the insert-only one of the audit trail).
SELECT public.app_secure_tables();
