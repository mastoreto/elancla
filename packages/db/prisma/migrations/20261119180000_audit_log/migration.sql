-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('success', 'denied', 'failure');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" UUID,
    "actorLabel" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "outcome" "AuditOutcome" NOT NULL DEFAULT 'success',
    "ip" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_entityType_entityId_idx" ON "audit_logs"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_actorId_idx" ON "audit_logs"("organizationId", "actorId");

-- AddForeignKey
-- RESTRICT, not CASCADE: referential actions run with the table owner's privileges, so a cascade
-- would erase the log even though app_runtime cannot DELETE from it.
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Append-only tables are skipped by app_secure_tables(): it would give them the generic
-- all-commands policy. The runtime role gets INSERT and SELECT only, by privilege (RLS alone
-- would silently update 0 rows instead of failing).
CREATE OR REPLACE FUNCTION public.app_secure_tables() RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  table_name text;
  append_only_tables constant text[] := ARRAY['audit_logs'];
BEGIN
  FOR table_name IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    CONTINUE WHEN table_name = ANY (append_only_tables);
    EXECUTE format('DROP POLICY IF EXISTS app_runtime_all ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY app_runtime_all ON public.%I TO app_runtime USING (true) WITH CHECK (true)',
      table_name
    );
  END LOOP;

  -- Supabase exposes the public schema through PostgREST with these roles; they get nothing.
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
  END IF;
END;
$$;

CREATE POLICY app_runtime_select ON "audit_logs" FOR SELECT TO app_runtime USING (true);
CREATE POLICY app_runtime_insert ON "audit_logs" FOR INSERT TO app_runtime WITH CHECK (true);
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "audit_logs" FROM app_runtime;

-- Data: whoever reviews the books must also see the audit trail. The seed does not reach roles
-- that already exist (it never updates them), so the existing auditor role gets it here.
INSERT INTO "role_permissions" ("roleId", "resource", "action", "scope")
SELECT "id", 'audit', 'view', 'all' FROM "roles" WHERE "key" = 'auditor'
ON CONFLICT DO NOTHING;

-- Every migration that creates tables ends by securing them (RLS + app_runtime policy).
SELECT public.app_secure_tables();
