// Runs the anonymous visitor purge by hand (the cron job calls the same use case through the API):
//   bun run --filter @ancla/api blog:purge-views
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { db } = await import("@ancla/db");
const { purgeViewVisitors } = await import("../../modules/blog/useCases");

try {
  const purged = await purgeViewVisitors();
  console.info(`Purged ${purged} visitor row(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
