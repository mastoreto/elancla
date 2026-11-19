import type { PermissionGrant } from "@ancla/contracts";
import { db } from "@ancla/db";
import type { Auth } from "../../src/core/auth";
import { resolveOrganizationId } from "../../src/core/tenancy";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "../../src/modules/identity/invitations/domain";

export const TEST_PASSWORD = "correct-horse-battery-staple";
const TEST_IP_PREFIX = "10.250";
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

interface InviteOptions {
  roleIds?: string[];
  ministryIds?: string[];
  expiresAt?: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
}

/**
 * Creates the users, invitations and rate-limit rows a test needs and removes all of them in
 * `cleanup()`, so the shared development database is left as it was found.
 */
export interface TestRoleOptions {
  grants?: PermissionGrant[];
  persistentSession?: boolean;
  maxSessionSeconds?: number | null;
}

/** Who a test user is: seeded role keys, or a grid that becomes a throwaway role. */
export type TestUserAccess = readonly string[] | readonly PermissionGrant[];

function isRoleKeyList(access: TestUserAccess): access is readonly string[] {
  return access.every((entry) => typeof entry === "string");
}

export function createFixtures() {
  const startedAt = new Date();
  const emails: string[] = [];
  const roleIds: string[] = [];
  const ministryIds: string[] = [];
  let ipCounter = 0;
  const ipBlock = Math.floor(Math.random() * 250);

  const fixtures = {
    uniqueEmail(label: string): string {
      const email = `${label}-${crypto.randomUUID()}@example.test`;
      emails.push(email);
      return email;
    },

    /** A valid IP no other test uses: HTTP-level rate limits are keyed by it. */
    uniqueIp(): string {
      ipCounter += 1;
      return `${TEST_IP_PREFIX}.${ipBlock}.${ipCounter}`;
    },

    /** Inserts an invitation directly and returns the plain token (only its hash is stored). */
    async invite(email: string, options: InviteOptions = {}): Promise<string> {
      const token = generateInvitationToken();
      await db.invitation.create({
        data: {
          organizationId: await resolveOrganizationId(),
          email,
          tokenHash: hashInvitationToken(token),
          roleIds: options.roleIds ?? [],
          ministryIds: options.ministryIds ?? [],
          expiresAt: options.expiresAt ?? new Date(Date.now() + ONE_DAY_MS),
          acceptedAt: options.acceptedAt,
          revokedAt: options.revokedAt,
        },
      });
      return token;
    },

    /** The id of a seeded role (`admin`, `treasurer`, `leader`...). */
    async roleIdByKey(key: string): Promise<string> {
      const role = await db.role.findFirstOrThrow({
        where: { organizationId: await resolveOrganizationId(), key },
        select: { id: true },
      });
      return role.id;
    },

    /** A throwaway role with exactly this grid and session policy. */
    async createRole(
      label: string,
      options: TestRoleOptions = {},
    ): Promise<string> {
      const role = await db.role.create({
        data: {
          organizationId: await resolveOrganizationId(),
          name: `test-${label}-${crypto.randomUUID()}`,
          persistentSession: options.persistentSession ?? true,
          maxSessionSeconds: options.maxSessionSeconds ?? null,
          permissions: { create: options.grants ?? [] },
        },
        select: { id: true },
      });
      roleIds.push(role.id);
      return role.id;
    },

    /** A throwaway ministry; removed in `cleanup()`. */
    async createMinistry(label: string): Promise<string> {
      const ministry = await db.ministry.create({
        data: {
          organizationId: await resolveOrganizationId(),
          name: `Test ${label}`,
          slug: `test-${label}-${crypto.randomUUID()}`,
        },
        select: { id: true },
      });
      ministryIds.push(ministry.id);
      return ministry.id;
    },

    async resolveAccessRoleIds(access: TestUserAccess): Promise<string[]> {
      if (access.length === 0) return [];
      if (isRoleKeyList(access)) {
        return Promise.all(access.map((key) => fixtures.roleIdByKey(key)));
      }
      return [await fixtures.createRole("grid", { grants: [...access] })];
    },

    /**
     * Invites the address and signs it up with a password; returns the user's email. The user
     * gets the seeded roles named by key, or a throwaway role with the given grid.
     */
    async passwordUser(
      auth: Auth,
      label: string,
      access: TestUserAccess = [],
      options: { ministryIds?: string[] } = {},
    ) {
      const email = fixtures.uniqueEmail(label);
      await fixtures.invite(email, {
        roleIds: await fixtures.resolveAccessRoleIds(access),
        ministryIds: options.ministryIds,
      });
      await auth.api.signUpEmail({
        body: { email, password: TEST_PASSWORD, name: `User ${label}` },
      });
      return email;
    },

    /** Cookie header of a brand-new session. */
    async signIn(auth: Auth, email: string): Promise<string> {
      const { headers } = await auth.api.signInEmail({
        body: { email, password: TEST_PASSWORD },
        returnHeaders: true,
      });
      return cookieHeaderFrom(headers);
    },

    async cleanup(): Promise<void> {
      await db.invitation.deleteMany({ where: { email: { in: emails } } });
      await db.user.deleteMany({ where: { email: { in: emails } } });
      await db.role.deleteMany({ where: { id: { in: roleIds } } });
      await db.ministry.deleteMany({ where: { id: { in: ministryIds } } });
      await db.verification.deleteMany({
        where: {
          createdAt: { gte: startedAt },
          OR: [
            { identifier: { startsWith: "2fa-" } },
            { identifier: { startsWith: "reset-password" } },
            { identifier: { startsWith: "auth-state" } },
          ],
        },
      });
      await db.rateLimit.deleteMany({
        where: {
          OR: [
            { key: { startsWith: TEST_IP_PREFIX } },
            { key: { contains: `:${TEST_IP_PREFIX}.` } },
          ],
        },
      });
      await db.$disconnect();
    },
  };
  return fixtures;
}

/** The `Cookie` header a browser would send back after this response. */
export function cookieHeaderFrom(source: Headers | Response): string {
  const headers = source instanceof Response ? source.headers : source;
  return headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0] as string)
    .filter((cookie) => !cookie.endsWith("="))
    .join("; ");
}
