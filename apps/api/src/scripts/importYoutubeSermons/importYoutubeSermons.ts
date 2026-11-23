// One-off import of the church's YouTube sermons (run in production at launch, phase 1.10):
//   bun run --filter @ancla/api import:sermons -- --org <slug> --playlist <id> [--dry-run]
// It is idempotent: what is already linked to a video is skipped. With --dry-run it prints what
// it would import and writes nothing. Needs YOUTUBE_API_KEY; the channel comes from the
// organization's site settings.
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { readImportArguments } from "./utils/readImportArguments";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { db } = await import("@ancla/db");
const { getVideoPlatform } = await import("../../core/platforms");
const { runYoutubeSermonImport } = await import("./runYoutubeSermonImport");

const USAGE =
  "Usage: bun run --filter @ancla/api import:sermons -- --org <slug> --playlist <id> [--dry-run]";

async function main(): Promise<void> {
  const { org, playlist, dryRun } = readImportArguments(process.argv.slice(2));
  if (!org || !playlist) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const platform = getVideoPlatform();
  if (!platform) {
    console.error(
      "YOUTUBE_API_KEY is not set: the import reads the videos from YouTube.",
    );
    process.exitCode = 1;
    return;
  }
  const report = await runYoutubeSermonImport({
    organizationSlug: org,
    playlist,
    dryRun,
    platform,
  });
  const verb = dryRun ? "Would import" : "Imported";
  console.info(
    `Playlist "${report.playlistTitle}"${dryRun ? " (dry run)" : ""}`,
  );
  for (const series of report.seriesCreated) {
    console.info(
      `  series ${dryRun ? "to create" : "created"}: ${series.title}`,
    );
  }
  for (const series of report.seriesReused) {
    console.info(`  series already imported: ${series.title}`);
  }
  for (const sermon of report.sermonsImported) {
    console.info(`  ${sermon.videoId}  ${sermon.title}`);
  }
  console.info(
    `${verb} ${report.sermonsImported.length} sermon(s), ${report.seriesCreated.length} new series; skipped ${report.sermonsSkipped.length}.`,
  );
  if (report.truncated) {
    console.warn(
      "The playlist has more videos than one run reads: run the import again.",
    );
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
