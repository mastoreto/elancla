// Creates the accounts the Playwright suite needs (invitation + password sign-up), idempotently.
// Run it against the test database: bun --env-file=.env.test run --filter @ancla/api seed:e2e
import { db } from "@ancla/db";
import { auditSourceForCli } from "../../core/audit";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";
import { issueInvitation } from "../../modules/identity/invitations/useCases";
import { E2E_PASSWORD, E2E_USERS, type E2eUser } from "./e2eUsers";
import { ensureE2eSiteKey } from "./ensureE2eSiteKey";

async function resolveRoleIds(
  organizationId: string,
  roleKey: string | null,
): Promise<string[]> {
  if (roleKey === null) return [];
  const role = await db.role.findUnique({
    where: { organizationId_key: { organizationId, key: roleKey } },
    select: { id: true },
  });
  if (!role)
    throw new Error(
      `There is no seeded role "${roleKey}" (run db:seed first).`,
    );
  return [role.id];
}

async function ensureUser(
  organizationId: string,
  user: E2eUser,
): Promise<void> {
  const existing = await db.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  if (existing) {
    if (user.resetTwoFactor) {
      await db.twoFactor.deleteMany({ where: { userId: existing.id } });
      await db.user.update({
        where: { id: existing.id },
        data: { twoFactorEnabled: false },
      });
    }
    return;
  }
  await issueInvitation({
    organizationId,
    email: user.email,
    roleIds: await resolveRoleIds(organizationId, user.roleKey),
    ministryIds: [],
    invitedById: null,
    audit: auditSourceForCli(organizationId),
  });
  await getAuth().api.signUpEmail({
    body: { email: user.email, password: E2E_PASSWORD, name: user.name },
  });
}

async function main(): Promise<void> {
  const organizationId = await resolveOrganizationId();
  for (const user of E2E_USERS) {
    await ensureUser(organizationId, user);
  }
  await ensureE2eSiteKey(organizationId, process.env.SITE_API_KEY);
  console.info(
    `E2E users and web site key ready: ${E2E_USERS.map((user) => user.email).join(", ")}`,
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
