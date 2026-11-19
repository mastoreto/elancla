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
  role?: "admin" | "viewer";
  expiresAt?: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
}

/**
 * Creates the users, invitations and rate-limit rows a test needs and removes all of them in
 * `cleanup()`, so the shared development database is left as it was found.
 */
export function createFixtures() {
  const startedAt = new Date();
  const emails: string[] = [];
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
          role: options.role ?? "viewer",
          expiresAt: options.expiresAt ?? new Date(Date.now() + ONE_DAY_MS),
          acceptedAt: options.acceptedAt,
          revokedAt: options.revokedAt,
        },
      });
      return token;
    },

    /** Invites the address and signs it up with a password; returns the user's email. */
    async passwordUser(
      auth: Auth,
      label: string,
      role: "admin" | "viewer" = "viewer",
    ) {
      const email = fixtures.uniqueEmail(label);
      await fixtures.invite(email, { role });
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
