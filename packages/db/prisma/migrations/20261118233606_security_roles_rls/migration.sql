-- Security baseline (D-21): the runtime role gets data access only and every application table
-- has Row Level Security enabled with a single policy for app_runtime. Any other role (e.g. the
-- Supabase Data API roles `anon` / `authenticated`) has no policy and therefore no rows.
--
-- Every future migration that creates tables must end with:
--   SELECT public.app_secure_tables();
-- A test fails if any table is left without RLS.

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_runtime;
-- Conditional: Prisma's shadow database replays migrations without creating _prisma_migrations.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM app_runtime;
  END IF;
END
$$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_runtime;

CREATE OR REPLACE FUNCTION public.app_secure_tables() RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
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

REVOKE ALL ON FUNCTION public.app_secure_tables() FROM PUBLIC;

SELECT public.app_secure_tables();
