// Creates an invitation and prints its link. Replaces the old password-based admin seed:
//   bun run --filter @ancla/api invite <email> [--role admin|viewer]
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { readInviteArguments } from "./readInviteArguments";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { createInvitationBody } = await import("@ancla/contracts");
const { db } = await import("@ancla/db");
const { resolveOrganizationId } = await import("../../core/tenancy");
const { buildInvitationUrl, issueInvitation } = await import(
  "../../modules/identity/invitations/useCases"
);

const USAGE =
  "Usage: bun run --filter @ancla/api invite <email> [--role admin|viewer]";

async function main(): Promise<void> {
  const { email, role } = readInviteArguments(process.argv.slice(2));
  const parsed = createInvitationBody.safeParse({ email, role });
  if (!parsed.success) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const { token } = await issueInvitation({
    organizationId: await resolveOrganizationId(),
    email: parsed.data.email,
    role: parsed.data.role,
    invitedById: null,
  });
  console.info(
    `Invitation for ${parsed.data.email} (${parsed.data.role}), valid for 7 days:`,
  );
  console.info(buildInvitationUrl(token));
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
