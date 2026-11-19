// Fails when prisma/schema.prisma has changes that no migration in prisma/migrations produces.
// Replays the migrations on a throwaway shadow database (app_migrator has CREATEDB) and diffs
// the result against the schema. Needs DATABASE_MIGRATION_URL, e.g. via `bun --env-file=.env.test`.
import { SQL } from "bun";
import { buildShadowUrl, shadowDatabaseName } from "./buildShadowUrl";

const DRIFT_EXIT_CODE = 2;

const migrationUrl = process.env.DATABASE_MIGRATION_URL;
if (!migrationUrl) {
  console.error(
    "DATABASE_MIGRATION_URL is required (use bun --env-file=.env.test).",
  );
  process.exit(1);
}

const admin = new SQL(migrationUrl);
const name = shadowDatabaseName();
await admin.unsafe(`DROP DATABASE IF EXISTS ${name}`);
await admin.unsafe(`CREATE DATABASE ${name}`);
await admin.close();

const diff = Bun.spawnSync(
  [
    "bunx",
    "prisma",
    "migrate",
    "diff",
    "--from-migrations",
    "prisma/migrations",
    "--to-schema",
    "prisma/schema.prisma",
    "--exit-code",
  ],
  {
    env: { ...process.env, DATABASE_SHADOW_URL: buildShadowUrl(migrationUrl) },
    stdout: "inherit",
    stderr: "inherit",
  },
);

if (diff.exitCode === DRIFT_EXIT_CODE) {
  console.error(
    "\nschema.prisma has changes without a migration. Run `bun run db:migrate`.",
  );
}
process.exit(diff.exitCode);
