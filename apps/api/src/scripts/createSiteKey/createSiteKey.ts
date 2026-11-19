// Creates a site key and prints it once, to paste into the web's .env (SITE_API_KEY):
//   bun run --filter @ancla/api site-key:create -- --name "web local"
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { readSiteKeyArguments } from "./readSiteKeyArguments";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { createSiteKeyBody } = await import("@ancla/contracts");
const { db } = await import("@ancla/db");
const { auditSourceForCli } = await import("../../core/audit");
const { resolveOrganizationId } = await import("../../core/tenancy");
const { createSiteKey } = await import("../../modules/siteKeys");

const USAGE =
  'Usage: bun run --filter @ancla/api site-key:create -- --name "<label>"';

async function main(): Promise<void> {
  const parsed = createSiteKeyBody.safeParse({
    name: readSiteKeyArguments(process.argv.slice(2)).name,
  });
  if (!parsed.success) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const organizationId = await resolveOrganizationId();
  const created = await createSiteKey({
    organizationId,
    body: parsed.data,
    createdById: null,
    audit: auditSourceForCli(organizationId),
  });
  console.info(`Site key "${created.name}" created. It is shown only now:`);
  console.info(created.key);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
