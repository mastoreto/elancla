// Runs the stale-upload purge by hand (the cron job calls the same use case through the API):
//   bun run --filter @ancla/api media:purge
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { db } = await import("@ancla/db");
const { purgeStaleUploads } = await import("../../modules/media/useCases");

try {
  const purged = await purgeStaleUploads();
  console.info(`Purged ${purged} stale upload(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
