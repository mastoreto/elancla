-- AlterTable
ALTER TABLE "invitations"
ADD COLUMN     "ministryIds" UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN     "roleIds" UUID[] DEFAULT ARRAY[]::UUID[];

-- CreateTable
CREATE TABLE "ministries" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ministries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "key" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "persistentSession" BOOLEAN NOT NULL DEFAULT true,
    "maxSessionSeconds" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" UUID NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","resource","action")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "user_ministries" (
    "userId" UUID NOT NULL,
    "ministryId" UUID NOT NULL,

    CONSTRAINT "user_ministries_pkey" PRIMARY KEY ("userId","ministryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ministries_organizationId_slug_key" ON "ministries"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "roles_organizationId_key_key" ON "roles"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "roles_organizationId_name_key" ON "roles"("organizationId", "name");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_ministries_ministryId_idx" ON "user_ministries"("ministryId");

-- AddForeignKey
ALTER TABLE "ministries" ADD CONSTRAINT "ministries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ministries" ADD CONSTRAINT "user_ministries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ministries" ADD CONSTRAINT "user_ministries_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data: every organization gets its implicit-full-access `admin` role; whoever was a flat
-- `admin` keeps that access, and pending admin invitations still invite an admin.
INSERT INTO "roles" ("id", "organizationId", "key", "name", "description", "updatedAt")
SELECT gen_random_uuid(), "id", 'admin', 'Administrador', 'Acceso total a todo el sistema.', CURRENT_TIMESTAMP
FROM "organizations";

INSERT INTO "user_roles" ("userId", "roleId")
SELECT u."id", r."id"
FROM "users" u
JOIN "roles" r ON r."key" = 'admin'
WHERE u."role" = 'admin'
  AND r."organizationId" = (SELECT "id" FROM "organizations" ORDER BY "createdAt" LIMIT 1);

UPDATE "invitations" i
SET "roleIds" = ARRAY[r."id"]
FROM "roles" r
WHERE i."role" = 'admin' AND r."key" = 'admin' AND r."organizationId" = i."organizationId";

-- Retire the flat role.
ALTER TABLE "invitations" DROP COLUMN "role";
ALTER TABLE "users" DROP COLUMN "role";

-- Every migration that creates tables ends by securing them (RLS + app_runtime policy).
SELECT public.app_secure_tables();
