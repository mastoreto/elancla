// Creates a site key and prints it once, to paste into the web's .env (SITE_API_KEY):
//   bun run --filter @ancla/api site-key:create -- --name "web local"
// With --write-env it also sets API_URL, SITE_API_KEY and SITE_CHURCH_SLUG in the root .env
// (--api-url overrides the default CRM dev origin) and does not print the key.
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { readSiteKeyArguments } from "./readSiteKeyArguments";
import { setEnvVariables } from "./utils/setEnvVariables";

const DEFAULT_API_URL = "http://localhost:3000";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(scriptDir, "../../../../../.env");
loadEnv({ path: ENV_PATH });

const { createSiteKeyBody } = await import("@ancla/contracts");
const { db } = await import("@ancla/db");
const { auditSourceForCli } = await import("../../core/audit");
const { resolveOrganizationId } = await import("../../core/tenancy");
const { createSiteKey } = await import("../../modules/siteKeys");

const USAGE =
  'Usage: bun run --filter @ancla/api site-key:create -- --name "<label>" [--write-env] [--api-url <origin>]';

function writeSiteEnv(values: Record<string, string>): void {
  const current = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  writeFileSync(ENV_PATH, setEnvVariables(current, values));
}

async function main(): Promise<void> {
  const args = readSiteKeyArguments(process.argv.slice(2));
  const parsed = createSiteKeyBody.safeParse({ name: args.name });
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
  if (!args.writeEnv) {
    console.info(`Site key "${created.name}" created. It is shown only now:`);
    console.info(created.key);
    return;
  }
  const organization = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { slug: true },
  });
  writeSiteEnv({
    API_URL: args.apiUrl ?? DEFAULT_API_URL,
    SITE_API_KEY: created.key,
    SITE_CHURCH_SLUG: organization.slug,
  });
  console.info(
    `Site key "${created.name}" created and saved to .env (API_URL, SITE_API_KEY, SITE_CHURCH_SLUG). Restart the web dev server.`,
  );
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
