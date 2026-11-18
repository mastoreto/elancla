#!/bin/sh
# Creates the two application roles (idempotent). Runs automatically on a fresh Docker volume
# (mounted in /docker-entrypoint-initdb.d) and can be re-run by hand:
#   docker compose exec db sh /docker-entrypoint-initdb.d/init-roles.sh
#
# app_migrator: owns the schema objects, runs migrations (CREATEDB only for Prisma's shadow DB).
# app_runtime:  what the apps connect with; data access only, no DDL. RLS policies target it.
set -eu

: "${APP_MIGRATOR_PASSWORD:?APP_MIGRATOR_PASSWORD is required}"
: "${APP_RUNTIME_PASSWORD:?APP_RUNTIME_PASSWORD is required}"

psql -v ON_ERROR_STOP=1 \
  -v migrator_password="$APP_MIGRATOR_PASSWORD" \
  -v runtime_password="$APP_RUNTIME_PASSWORD" \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
SELECT 'CREATE ROLE app_migrator LOGIN CREATEDB'
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_migrator') \gexec
SELECT 'CREATE ROLE app_runtime LOGIN'
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_runtime') \gexec

ALTER ROLE app_migrator PASSWORD :'migrator_password';
ALTER ROLE app_runtime PASSWORD :'runtime_password';

GRANT CONNECT ON DATABASE :"DBNAME" TO app_migrator, app_runtime;
GRANT USAGE, CREATE ON SCHEMA public TO app_migrator;
GRANT USAGE ON SCHEMA public TO app_runtime;
SQL
