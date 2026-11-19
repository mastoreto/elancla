-- CreateTable
CREATE TABLE "site_api_keys" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "site_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_api_keys_organizationId_revokedAt_idx" ON "site_api_keys"("organizationId", "revokedAt");

-- AddForeignKey
ALTER TABLE "site_api_keys" ADD CONSTRAINT "site_api_keys_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_api_keys" ADD CONSTRAINT "site_api_keys_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Common table: generic app_runtime policy (RLS enabled).
SELECT public.app_secure_tables();

-- Keys are revoked (revokedAt), never deleted, so the revocation stays auditable.
REVOKE DELETE ON TABLE "site_api_keys" FROM app_runtime;
