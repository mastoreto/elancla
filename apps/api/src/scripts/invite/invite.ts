// Creates an invitation and prints its link. Replaces the old password-based admin seed:
//   bun run --filter @ancla/api invite <email> [--role <role-key>]
// Run it from the monorepo root; the root .env is loaded before anything touches the database.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { readInviteArguments } from "./readInviteArguments";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { ADMIN_ROLE_KEY, createInvitationBody } = await import(
  "@ancla/contracts"
);
const { db } = await import("@ancla/db");
const { resolveOrganizationId } = await import("../../core/tenancy");
const { buildInvitationUrl, issueInvitation } = await import(
  "../../modules/identity/invitations/useCases"
);

const USAGE =
  "Usage: bun run --filter @ancla/api invite <email> [--role <role-key>]";

async function main(): Promise<void> {
  const { email, role: roleKey = ADMIN_ROLE_KEY } = readInviteArguments(
    process.argv.slice(2),
  );
  // The role id is only known once it is looked up, so the body is validated with a placeholder.
  const parsed = createInvitationBody.safeParse({
    email,
    roleIds: [crypto.randomUUID()],
  });
  if (!parsed.success) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const organizationId = await resolveOrganizationId();
  const role = await db.role.findUnique({
    where: { organizationId_key: { organizationId, key: roleKey } },
    select: { id: true },
  });
  if (!role) {
    console.error(`There is no seeded role "${roleKey}" (run db:seed first).`);
    process.exitCode = 1;
    return;
  }
  const { token } = await issueInvitation({
    organizationId,
    email: parsed.data.email,
    roleIds: [role.id],
    ministryIds: [],
    invitedById: null,
  });
  console.info(
    `Invitation for ${parsed.data.email} (${roleKey}), valid for 7 days:`,
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
