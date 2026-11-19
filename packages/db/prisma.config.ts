// Prisma CLI config (generate / migrate / studio / seed).
// Loads the monorepo root .env; dotenv never overrides variables that are already set
// (e.g. the ones docker-compose injects) and ignores a missing file.
// The CLI connects as the migrator role (DDL owner); the apps use DATABASE_URL (runtime role).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const dir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(dir, "../../.env") });

export default defineConfig({
  schema: path.join(dir, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(dir, "prisma", "migrations"),
    seed: "bun run prisma/seed/seed.ts",
  },
  datasource: {
    // Optional so `prisma generate` works without a database.
    url: process.env.DATABASE_MIGRATION_URL,
    // Only used by `prisma migrate diff --from-migrations` (db:drift); empty elsewhere.
    shadowDatabaseUrl: process.env.DATABASE_SHADOW_URL,
  },
});
